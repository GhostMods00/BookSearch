import { AuthenticationError, UserInputError } from '../utils/errors.js';
import User from '../models/User.js';  
import { signToken } from '../utils/auth.js';
import Context from '../types/context.js';
import type { UserDocument } from '../models/User.js';

// Input types for resolvers
interface BookInput {
  authors: string[];
  description: string;
  title: string;
  bookId: string;
  image?: string;
  link?: string;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context): Promise<UserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
      return await User.findById(context.user._id);
    },
  },

  Mutation: {
    addUser: async (_parent: unknown, { username, email, password }: UserInput): Promise<{ token: string; user: UserDocument }> => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        throw new UserInputError('Invalid user data provided');
      }
    },

    login: async (_parent: unknown, { email, password }: LoginInput): Promise<{ token: string; user: UserDocument }> => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (_parent: unknown, { bookData }: { bookData: BookInput }, context: Context): Promise<UserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        throw new UserInputError('Invalid book data provided');
      }
    },

    removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: Context): Promise<UserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      } catch (err) {
        throw new UserInputError('Error removing book');
      }
    },
  },
};

export default resolvers;