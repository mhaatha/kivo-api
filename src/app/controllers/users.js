// import { greetUser } from '../services/users.js';

export async function greetUser(req, res) {
  try {
    // const sayHi = await greetUser()

    res.send('Hello Guest!');
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function greetLogin(req, res) {
  try {
    // const sayHi = await greetUser()

    res.send('Hello Login!');
  } catch (err) {
    res.status(500).send(err);
  }
}
