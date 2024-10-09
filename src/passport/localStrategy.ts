import { error } from 'console';
import { UserType } from '../types/interface';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import prisma from '../prisma/index';
import bcrypt from 'bcrypt';

// NOTE: Input authentication values are different then StrategyOptions should be updated
// example: { usernameField: 'email', passwordField: 'passcode' },
export default passport.use(
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      console.log('Inside LocalStrategy', { username, password });

      try {
        const user = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (!user) throw error('Username not found');

        bcrypt.compare(password, user.password, (err, result) => {
          console.log({ err, result });
          if (result) {
            done(null, user);
          } else {
            done('password does not match', false);
          }
        });
      } catch (error) {
        console.error({ error });

        done('Username not found', false);
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
  done(null, {
    id: (user as UserType).id,
    username: (user as UserType).username,
  });
});

// After initial authentication and Serialization, for subsequent calls from the same client
// only deserialization function will be called to verify if the session is still valid
// once session expires "passport: { user: 1 }" prop is removed from the session object
passport.deserializeUser(async function (user, done) {
  const stringId = (user as UserType).id.toString();

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: stringId,
      },
    });

    console.log('Inside deserializeUser', { user });

    if (!user) throw error('User not found');

    done(false, user);
  } catch (error) {
    done(error, false);
  }
});
