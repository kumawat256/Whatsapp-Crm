import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function mockHost(overrides: { type?: string } = {}) {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const request = {
    method: 'GET',
    url: '/api/whatever',
    user: { id: 'user-1' },
  };
  const host = {
    getType: () => overrides.type ?? 'http',
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('AllExceptionsFilter', () => {
  it('passes an HttpException through with its own status and body', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = mockHost();

    filter.catch(new BadRequestException('bad input'), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'bad input' }),
    );
  });

  it('sanitizes an unexpected error into a generic 500 without leaking its message', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = mockHost();

    filter.catch(new Error('leaked internal detail: db password xyz'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    const body = response.json.mock.calls[0][0];
    expect(body.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('leaked internal detail');
  });

  it('does not touch the response for a non-HTTP context', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = mockHost({ type: 'ws' });

    filter.catch(new Error('gateway error'), host);

    expect(response.status).not.toHaveBeenCalled();
  });
});
