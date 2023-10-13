import { User } from "../../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../utils/config";
import UserInfo from "../../utils/UserInfo";

const editUserHandler = async (
  email: string | undefined,
  password: string | undefined,
  name: string | undefined,
  logo: string | undefined,
  about: string | undefined,
  firstname: string | undefined,
  lastname: string | undefined,
  country: string | undefined,
  city: string | undefined,
  zipcode: string | undefined
) => {
  let hashedPass;
  if (password) {
    const SALT_ROUNDS: number = 10;
    hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
  }

  await User.update(
    {
      password: hashedPass,
      name,
      logo,
      about,
    },
    { where: { email } }
  );

  const user = await User.findOne({ where: { email } });

  const userInfo: UserInfo = {
    email,
    name,
    logo,
    about,
    firstname,
    lastname,
    country,
    city,
    zipcode,
  };

  const secretKey = config.secretKey;
  const token = jwt.sign(userInfo, secretKey, { expiresIn: "1h" });

  return token;
};

export default editUserHandler;
