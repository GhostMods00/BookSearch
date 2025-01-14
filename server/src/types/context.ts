import type { UserDocument } from '../models/User.js';

type Context = {
  user?: UserDocument | null;
};

export default Context;