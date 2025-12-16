import { MailService } from '../src/mail/mail.service';

describe('MailService (unit)', () => {
  let mailService: MailService;
  const sendMailMock = jest.fn();

  beforeEach(() => {
    sendMailMock.mockReset();
    const mailer: any = { sendMail: sendMailMock };
    mailService = new MailService(mailer as any);
  });

  it('sendAccountRequest -> should call sendMail twice on success', async () => {
    sendMailMock.mockResolvedValue(undefined);
    await expect(
      mailService.sendAccountRequest('Jan', 'Janssen', 'user@example.com'),
    ).resolves.toBeUndefined();
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });

  it('sendAccountRequest -> propagates error when mailer fails', async () => {
    sendMailMock.mockRejectedValue(new Error('smtp fail'));
    await expect(
      mailService.sendAccountRequest('Jan', 'Janssen', 'user@example.com'),
    ).rejects.toThrow('smtp fail');
    expect(sendMailMock).toHaveBeenCalled();
  });

  it('sendTransactionReport -> success path', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const buf = Buffer.from('pdf');
    await expect(
      mailService.sendTransactionReport('u@e.com', 'Jan', buf),
    ).resolves.toBeUndefined();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });

  it('sendTransactionReport -> throws on failure', async () => {
    sendMailMock.mockRejectedValue(new Error('smtp fail'));
    const buf = Buffer.from('pdf');
    await expect(
      mailService.sendTransactionReport('u@e.com', 'Jan', buf),
    ).rejects.toThrow('smtp fail');
  });

  it('sendNotification -> swallows errors (does not rethrow)', async () => {
    sendMailMock.mockRejectedValue(new Error('notify fail'));
    await expect(
      mailService.sendNotification('to@x.com', 'Hey', 'line1'),
    ).resolves.toBeUndefined();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});
