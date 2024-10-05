export const userValidationSchema = {
  firstname: {
    isLength: {
      options: {
        min: 3,
        max: 12,
      },
      errorMessage: 'firstname must be min 3 chars and max 10 chars in length',
    },
    notEmpty: {
      errorMessage: 'firstname cannot be empty',
    },
    isString: {
      errorMessage: 'firstname must be string',
    },
  },
  lastname: {
    isLength: {
      options: {
        min: 3,
        max: 12,
      },
      errorMessage: 'lastname must be min 3 chars and max 10 chars in length',
    },
    notEmpty: {
      errorMessage: 'lastname cannot be empty',
    },
    isString: {
      errorMessage: 'lastname must be string',
    },
  },
  username: {
    isLength: {
      options: {
        min: 3,
        max: 12,
      },
      errorMessage: 'username must be min 3 chars and max 10 chars in length',
    },
    notEmpty: {
      errorMessage: 'username cannot be empty',
    },
    isString: {
      errorMessage: 'username must be string',
    },
  },
  password: {
    isLength: {
      options: {
        min: 3,
        max: 12,
      },
      errorMessage: 'password must be min 3 chars and max 10 chars in length',
    },
    notEmpty: {
      errorMessage: 'password cannot be empty',
    },
    isString: {
      errorMessage: 'password must be string',
    },
  },
};
