#! /usr/bin/env node

const path = require('path');
const minimist = require('minimist');
const { execSync } = require('child_process');
const { stripIndent, oneLine } = require('common-tags');
const { gitAuthors } = require('../git-authors');
const { gitMessage } = require('../git-message');

const gitMessagePath =
  process.env.GITMOB_MESSAGE_PATH ||
  commitTemplatePath() ||
  path.join('.git', '.gitmessage');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

if (argv.help) {
  runHelp();
  process.exit(0);
}
if (argv.version) {
  runVersion();
  process.exit(0);
}

runMob(argv._);

function runHelp() {
  const message = stripIndent`
    Usage
      $ git mob <co-author-initials>
      $ git solo

    Options
      -h  Prints usage information
      -v  Prints current version

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
      $ git solo       # Dissipate the mob
  `;
  console.log(message);
}

function runVersion() {
  console.log(require('../package.json').version);
}

function runMob(args) {
  if (args.length === 0) {
    printMob();
  } else {
    setMob(args);
  }
}

function printMob() {
  console.log(author());

  if (isCoAuthorSet()) {
    console.log(coauthors());
  }
}

function setMob(initials) {
  const authors = gitAuthors();
  const message = gitMessage(gitMessagePath);
  authors
    .read()
    .then(authorList => authors.coAuthors(initials, authorList))
    .then(coAuthors => {
      setCommitTemplate();
      resetMob();
      coAuthors.forEach(addCoAuthorToGitConfig);
      message.writeCoAuthors(coAuthors);
      // TODO: Set commit template
      // TODO: Append to .git/gitmessage
      printMob();
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

function author() {
  const name = silentRun('git config user.name').stdout.trim();
  const email = silentRun('git config user.email').stdout.trim();
  return oneLine`${name} <${email}>`;
}

function coauthors() {
  return silentRun('git config --get-all git-mob.co-author').stdout.trim();
}

function isCoAuthorSet() {
  const { code } = silentRun('git config git-mob.co-author');
  return code === 0;
}

function addCoAuthorToGitConfig(coAuthor) {
  silentRun(`git config --add git-mob.co-author "${coAuthor}"`);
}

function resetMob() {
  silentRun('git config --remove-section git-mob');
}

function silentRun(command) {
  try {
    return {
      stdout: execSync(command, { encoding: 'utf8' }),
      code: 0,
    };
  } catch (err) {
    return {
      code: err.status,
      pid: err.pid,
      stderr: err.stderr,
      stdout: err.stdout,
      cmd: err.cmd,
    };
  }
}

function setCommitTemplate() {
  const { code } = silentRun('git config commit.template');
  if (code !== 0) silentRun(`git config commit.template ${gitMessagePath}`);
}

function commitTemplatePath() {
  return silentRun('git config commit.template').stdout.trim();
}
