import { serialize, parse } from 'cookie';

export function setCookie(res: any, name: string, value: string, opts: any = {}) {
  const cookie = serialize(name, value, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    ...opts
  });
  res.headers.append('Set-Cookie', cookie);
}

export function parseCookies(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  return parse(cookie);
}
