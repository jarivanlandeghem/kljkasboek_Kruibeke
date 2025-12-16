import { MailService } from '../src/mail/mail.service';

describe('MailService (unit-like)', () => {
  let mailerMock: { sendMail: jest.Mock };
  let svc: MailService;

  beforeEach(() => {
    mailerMock = { sendMail: jest.fn().mockResolvedValue(undefined) } as any;
    // Construct MailService directly with the mocked MailerService
    svc = new MailService(mailerMock as any);
  });

  it('sendNotification calls mailer and resolves', async () => {
    await expect(svc.sendNotification('user@example.com', 'Hi', 'body')).resolves.toBeUndefined();
    expect(mailerMock.sendMail).toHaveBeenCalledTimes(1);
    const callArg = mailerMock.sendMail.mock.calls[0][0];
    expect(callArg).toMatchObject({ to: 'user@example.com', subject: 'Hi' });
  });

  it('sendTransactionReport throws when mailer fails', async () => {
    mailerMock.sendMail.mockRejectedValueOnce(new Error('smtp fail'));
    await expect(svc.sendTransactionReport('u@e.com', 'First', Buffer.from('pdf'))).rejects.toThrow('smtp fail');
  });

  it('sendTransactionReport succeeds when mailer resolves', async () => {
    await expect(svc.sendTransactionReport('u@e.com', 'First', Buffer.from('pdf'))).resolves.toBeUndefined();
    expect(mailerMock.sendMail).toHaveBeenCalled();
  });
});
