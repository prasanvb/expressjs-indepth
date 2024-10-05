import { error } from 'console';
import { userList } from '../utils/mocks';
import { UserType } from '../types/interface';
import passport from 'passport';
import { IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';

export interface PassportLocalStrategyType {
  username: string;
  password: string;
  done: (
    error: any | false,
    user?: Express.User | false,
    options?: IVerifyOptions,
  ) => void;
}

// NOTE: Input authentication values are different then StrategyOptions should be updated
// example: { usernameField: 'email', passwordField: 'passcode' },
export default passport.use(
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    function (
      username: string,
      password: string,
      done: (
        error: any | false,
        user?: Express.User | false,
        options?: IVerifyOptions,
      ) => void,
    ) {
      console.log('Inside LocalStrategy', { username, password });
      try {
        const getUser = userList.find((user) => user.username === username);
        if (!getUser) throw error('User with a matching username not found');
        if (getUser.password !== password)
          throw error('Invalid passpword credentials');
        done(false, getUser, { message: 'invalid credentials' });
      } catch (error) {
        done(error, false, { message: 'valid credentials' });
      }
    },
  ),
);

// During '/api/auth' call if passport.authenticate is success then
// Serialization happens only after authentication process
passport.serializeUser(function (user, done) {
  console.log('Inside serializeUser', user);

  // Manipulates session object and add "passport: { user: 1 }" prop
  // you can attach any prop to the session data
  done(null, (user as UserType).id);
});

// After initial authentication and Serialization, for subsequent calls from the same client
// only deserialization function will be called to verify if the session is still valid
// once session expires "passport: { user: 1 }" prop is removed from the session object
passport.deserializeUser(function (id: number, done) {
  console.log('Inside deserializeUser');

  try {
    const getUser = userList.find((user) => user.id === id);

    if (!getUser) {
      throw error('User with a matching id not found');
    }

    done(false, 'getUser');
  } catch (error) {
    done(error, false);
  }
});
