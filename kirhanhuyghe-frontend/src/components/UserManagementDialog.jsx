// src/components/UserManagementDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit, AdminPanelSettings, Close, Save } from '@mui/icons-material';
import useSWR, { mutate } from 'swr';
import * as api from '../api';
import { useAuth } from '../contexts/auth';

const AVAILABLE_ROLES = ['user', 'admin', 'leiding']; 

export default function UserManagementDialog() {
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState('');

  // Data fetchen
  const { data: users, isLoading } = useSWR(
    open ? 'users' : null, 
    api.getAll
  );

  // BEVEILIGING: Alleen admins zien de knop
  if (!currentUser?.roles?.includes('admin')) {
    return null;
  }

  const handleEditClick = (user) => {
    setEditingUser(user.userid);
    // Zorg dat we altijd een array hebben
    setSelectedRoles(Array.isArray(user.roles) ? user.roles : [user.roles]);
    setError('');
  };

  const handleSaveRoles = async (userId) => {
    try {
      // We sturen 'roles' als array, maar als je DTO 'role' (string) verwacht:
      // Pas dit aan naar wat je backend updateUserDto verwacht.
      // Op basis van je vorige inputs leek de DTO 'role' (enkelvoud string) te verwachten, 
      // maar je database is JSON array. Ik stuur hier beide voor de zekerheid.
      await api.updateUser(userId, { 
        role: selectedRoles[0], // Legacy support voor DTO
        roles: selectedRoles    // Toekomst support
      });
      
      mutate('users'); // Herlaad de lijst
      setEditingUser(null);
    } catch (err) {
      setError('Kon rollen niet opslaan. Ben je zeker dat je admin rechten hebt?');
      console.error(err);
    }
  };

  return (
    <>
      {/* De Knop op de pagina */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
        <Button 
          variant="outlined" 
          color="warning" 
          startIcon={<AdminPanelSettings />}
          onClick={() => setOpen(true)}
        >
          Admin: Beheer Gebruikers
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Gebruikers & Rollen
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {users?.map((u) => (
                <ListItem 
                  key={u.userid} 
                  divider
                  secondaryAction={
                    editingUser === u.userid ? (
                      <Box>
                        <IconButton color="primary" onClick={() => handleSaveRoles(u.userid)}>
                          <Save />
                        </IconButton>
                        <IconButton color="error" onClick={() => setEditingUser(null)}>
                          <Close />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton onClick={() => handleEditClick(u)}>
                        <Edit />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {u.voornaam} {u.familienaam}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="body2">
                          {u.email}
                        </Typography>
                        
                        {editingUser === u.userid ? (
                           <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                             <Select
                               multiple
                               value={selectedRoles}
                               onChange={(e) => setSelectedRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                               renderValue={(selected) => selected.join(', ')}
                             >
                               {AVAILABLE_ROLES.map((role) => (
                                 <MenuItem key={role} value={role}>
                                   {role}
                                 </MenuItem>
                               ))}
                             </Select>
                           </FormControl>
                        ) : (
                          <Box component="span">
                            {u.roles?.map(r => (
                              <Chip key={r} label={r} size="small" color={r === 'admin' ? 'error' : 'primary'} variant="outlined" sx={{ mr: 0.5 }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Sluiten</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}