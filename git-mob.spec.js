import test from 'ava';
import { exec } from 'shelljs';
import { stripIndent } from 'common-tags';

test.after.always('cleanup', () => {
  exec('git config --remove-section user');
  exec('git config --remove-section git-mob');
});

test('-h prints help', async t => {
  const { stdout } = await exec('git mob -h', { silent: true });

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});

if (process.platform === 'win32') {
  // Windows tries to open a man page at git-doc/git-mob.html which errors.
  test.skip('--help is intercepted by git launcher on Windows', () => {});
} else {
  test('--help is intercepted by git launcher', async t => {
    const { code, stderr } = await exec('git mob --help', { silent: true });

    t.not(code, 0);
    t.regex(stderr, /no manual entry for git-mob/i);
  });
}

test('-v prints version', async t => {
  const { stdout } = await exec('git mob -v', { silent: true });

  t.regex(stdout, /\d.\d.\d/);
});

test('--version prints version', async t => {
  const { stdout } = await exec('git mob --version', { silent: true });

  t.regex(stdout, /\d.\d.\d/);
});

test('prints only primary author when there is no mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  const actual = exec('git mob', { silent: true }).stdout.trimRight();

  t.is(actual, 'John Doe <jdoe@example.com>');

  removeAuthor();
});

test('prints current mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  addCoAuthor('Dennis Ideler', 'dideler@findmypast.com');
  addCoAuthor('Richard Kotze', 'rkotze@findmypast.com');

  const actual = exec('git mob', { silent: true }).stdout.trimRight();
  const expected = stripIndent`
    John Doe <jdoe@example.com>
    Dennis Ideler <dideler@findmypast.com>
    Richard Kotze <rkotze@findmypast.com>
  `;

  t.is(actual, expected);

  removeAuthor();
  removeCoAuthors();
});

test.serial.todo('overwrites old mob when setting a new mob');

test('missing author when setting co-author mob rk', async t => {
  const { stdout } = await exec('git mob rk', { silent: true });

  t.regex(stdout, /Author with initials "rk" not found!/i);
});

function addAuthor(name, email) {
  exec(`git config user.name "${name}"`);
  exec(`git config user.email "${email}"`);
}

function removeAuthor() {
  exec('git config --unset user.name');
  exec('git config --unset user.email');
}

function addCoAuthor(name, email) {
  exec(`git config --add git-mob.co-author "${name} <${email}>"`);
}

function removeCoAuthors() {
  exec('git config --unset-all git-mob.co-author');
}