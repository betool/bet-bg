import 'reflect-metadata';
import { Service, Container } from 'typedi';

@Service()
class TokenService {
  private secretKey;

  constructor() {
    this.secretKey = 'secret';
  }

  decode(token: string) {
    return '11';
  }
}

@Service()
class User {
  constructor(private readonly tokenService: TokenService) {}

  checkUserToken(data: any) {
    const { token } = data;
    const payload = this.tokenService.decode(token);
    console.log({ payload });
  }
}

const token = 'secret';

const user = Container.get(User);
user.checkUserToken({ token });

test('adds 1 + 2 to equal 3', () => {
  expect(3).toBe(3);
});
