import { TransactieService } from '../src/transacties/transacties.service';
import { NotFoundException } from '@nestjs/common';

describe('TransactieService (unit-like)', () => {
  let dbMock: any;
  let mailMock: any;
  let svc: TransactieService;

  beforeEach(() => {
    mailMock = { sendTransactionReport: jest.fn().mockResolvedValue(undefined) };

    dbMock = {
      query: {
        transacties: { findFirst: jest.fn(), findMany: jest.fn() },
        categorieen: { findMany: jest.fn() },
      },
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      select: jest.fn(),
    };

    // default simple behaviors
    dbMock.insert.mockReturnValue({ values: () => ({ $returningId: async () => [{ transactieID: 1 }] }) });
    dbMock.delete.mockReturnValue({ where: async () => ({ affectedRows: 1 }) });

    svc = new TransactieService(dbMock as any, mailMock as any);
  });

  it('getById throws NotFound if not found', async () => {
    dbMock.query.transacties.findFirst.mockResolvedValueOnce(undefined);
    await expect(svc.getById(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getById returns mapped DTO when found', async () => {
    const row = { transactieID: 5, userID: 2, beschrijving: 'T', in_uit: 'IN', bedrag: '12.34', datum: '2025-11-01' };
    dbMock.query.transacties.findFirst.mockResolvedValueOnce(row);
    const res = await svc.getById(5);
    expect(res.transactieID).toBe(5);
    expect(res.bedrag).toBeCloseTo(12.34);
  });

  it('updateCategorieKoppelingen deletes and inserts when provided', async () => {
    const deleteMock = jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue({}) });
    const insertMock = jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue({}) });
    dbMock.delete = deleteMock;
    dbMock.insert = insertMock;

    await svc.updateCategorieKoppelingen(10, [1, 2]);
    expect(deleteMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
  });

  it('updateCategorieKoppelingen deletes and skips insert when empty', async () => {
    const deleteMock = jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue({}) });
    const insertMock = jest.fn();
    dbMock.delete = deleteMock;
    dbMock.insert = insertMock;

    await svc.updateCategorieKoppelingen(11, []);
    expect(deleteMock).toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('generateAndMailReport throws when no data', async () => {
    // mock the chained select().from(...).leftJoin(...).leftJoin(...).where() returning []
    dbMock.select.mockImplementation(() => ({ from: () => ({ leftJoin: () => ({ leftJoin: () => ({ where: async () => [] }) }) }) }));
    await expect(svc.generateAndMailReport(1, 'u@e.com', 'Name')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('generateAndMailReport with data calls mailer', async () => {
    const rawData = [
      { bedrag: '100', datum: '2025-11-01', beschrijving: 'X', in_uit: 'IN', categorieNaam: 'Cat' },
    ];
    dbMock.select.mockImplementation(() => ({ from: () => ({ leftJoin: () => ({ leftJoin: () => ({ where: async () => rawData }) }) }) }));

    // stub createPdfBuffer to avoid real PDF generation
    jest.spyOn<any, any>(svc as any, 'createPdfBuffer').mockResolvedValue(Buffer.from('pdf'));

    await expect(svc.generateAndMailReport(2, 'u@e.com', 'First')).resolves.toBeUndefined();
    expect(mailMock.sendTransactionReport).toHaveBeenCalledWith('u@e.com', 'First', expect.any(Buffer));
  });
});
