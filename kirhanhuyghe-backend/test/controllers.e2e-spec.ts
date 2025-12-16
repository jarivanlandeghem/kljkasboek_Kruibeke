import { AanwezighedenController } from '../src/aanwezigheden/aanwezigheden.controller';
import { EvenementenController } from '../src/evenementen/evenementen.controller';
import { LeidingProfielController } from '../src/leidingprofiel/leidingprofiel.controller';

describe('Simple controllers', () => {
  it('AanwezighedenController forwards calls to service', () => {
    const mockService: any = {
      create: jest.fn().mockReturnValue({ ok: true }),
      findAll: jest.fn().mockReturnValue([]),
      getById: jest.fn().mockReturnValue({ id: 1 }),
      findByEventId: jest.fn().mockReturnValue([]),
      findByUserId: jest.fn().mockReturnValue([]),
      update: jest.fn().mockReturnValue({ id: 1 }),
      remove: jest.fn().mockReturnValue(undefined),
    };

    const ctrl = new AanwezighedenController(mockService);

    expect(ctrl.create({})).toEqual({ ok: true });
    expect(ctrl.findAll()).toEqual([]);
    expect(ctrl.findOne('1')).toEqual({ id: 1 });
    expect(ctrl.findByEvent('2')).toEqual([]);
    expect(ctrl.findByUser('3')).toEqual([]);
    expect(ctrl.update('1', {})).toEqual({ id: 1 });
    expect(ctrl.remove('1')).toEqual(undefined);
  });

  it('EvenementenController forwards and returns message for pdf', async () => {
    const mockService: any = {
      getAll: jest.fn().mockResolvedValue([]),
      getById: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 2 }),
      updateById: jest.fn().mockResolvedValue({ id: 2 }),
      deleteById: jest.fn().mockResolvedValue(undefined),
      generateAndMailAttendanceList: jest.fn().mockResolvedValue(undefined),
    };

    const ctrl = new EvenementenController(mockService);

    await expect(ctrl.findAll()).resolves.toEqual([]);
    await expect(ctrl.findOne('1')).resolves.toEqual({ id: 1 });
    await expect(ctrl.create({} as any)).resolves.toEqual({ id: 2 });
    await expect(ctrl.update('2', {} as any)).resolves.toEqual({ id: 2 });
    await expect(ctrl.remove('2')).resolves.toEqual(undefined);

    const res = await ctrl.generatePdf('5', { email: 'a@b', naam: 'X' });
    expect(res).toEqual({ message: 'Aanwezigheidslijst verzonden per mail.' });
  });

  it('LeidingProfielController basic forwarding', () => {
    const mockService: any = {
      create: jest.fn().mockReturnValue({ id: 1 }),
      findAll: jest.fn().mockReturnValue([]),
      getById: jest.fn().mockReturnValue({ id: 1 }),
      getByUserId: jest.fn().mockReturnValue({ id: 1 }),
      update: jest.fn().mockReturnValue({ id: 1 }),
      remove: jest.fn().mockReturnValue(undefined),
    };

    const ctrl = new LeidingProfielController(mockService);

    expect(ctrl.create({})).toEqual({ id: 1 });
    expect(ctrl.findAll()).toEqual([]);
    expect(ctrl.findOne('1')).toEqual({ id: 1 });
    expect(ctrl.findByUser('2')).toEqual({ id: 1 });
    expect(ctrl.update('1', {})).toEqual({ id: 1 });
    expect(ctrl.remove('1')).toEqual(undefined);
  });
});
