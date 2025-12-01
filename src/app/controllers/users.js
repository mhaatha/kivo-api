// const { greetUser } = require('../services/users.js')

async function greetUser(req, res) {
  try {
    // const sayHi = await greetUser()

    res.send('Hello Guest!');
  } catch (err) {
    res.status(500).send(err);
  }
}

async function greetLogin(req, res) {
  try {
    // const sayHi = await greetUser()

    res.send('Hello Login!');
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { greetUser, greetLogin };
