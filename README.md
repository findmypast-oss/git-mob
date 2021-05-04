# Git Mob ![npm downloads](https://img.shields.io/npm/dm/git-mob.svg) [![npm version](https://badge.fury.io/js/git-mob.svg)](https://www.npmjs.com/package/git-mob) [![build status](https://travis-ci.org/findmypast-oss/git-mob.svg?branch=master)](https://travis-ci.org/findmypast-oss/git-mob)

> A command-line tool for social coding

Includes co-authors in commits when you collaborate on code. Use when pairing with a buddy or mobbing with your team.

Read our blog post to find out why git-mob exists: [Co-author commits with Git Mob](http://tech.findmypast.com/co-author-commits-with-git-mob)

[**New** Git Mob VS Code extension](https://github.com/rkotze/git-mob-vs-code)

![gif showing example usage of git-mob](https://user-images.githubusercontent.com/497458/38682926-2e0cc99c-3e64-11e8-9f71-6336e111005b.gif)

1. [Install](#install)
2. [Using `git commit -m`](#using-git-commit--m-setup)
3. [Workflow / Usage](#workflow--usage)
4. [More commands](#more-commands)
   1. [List all co-authors](#list-all-co-authors)
   2. [Overwrite the main author](#list-all-co-authors)
   3. [Add co-author](#add-co-author)
   4. [Delete co-author](#delete-co-author)
   5. [Edit co-author](#edit-co-author)
   6. [Add initials of current mob to PS1, in bash and fish](#add-initials-of-current-mob-to-your-prompt)

## Install

git-mob is a CLI tool, so you'll need to install the package globally.

```
npm i -g git-mob
```

By default git-mob will use the `.gitmessage` template to append co-authors.

### Using `git commit -m` setup

How to append co-authors to the message when using message flag - `git commit -m "commit message"`?

1. Add `prepare-commit-msg` hook file in `.git/hooks` dir. See [hook-examples](https://github.com/findmypast-oss/git-mob/tree/master/hook-examples)
2. The **hook** will need to be executable `chmod +x prepare-commit-msg`

`prepare-commit-msg` will need a script to read the co-authors, which can be done via `git mob-print`. See [hook-examples](https://github.com/findmypast-oss/git-mob/tree/master/hook-examples) folder for working scripts.

The command `git mob-print` will output to `stdout` the formatted co-authors.

**Note:** > `v1.1.0` `git mob --installTemplate` and `git mob --uninstallTemplate` has been removed.

#### Using pre-commit to install
You can install the githook using pre-commit. Add the following to your `pre-commit-config.yaml`
```yaml
repos:
  - repo: https://github.com/findmypast-oss/git-mob
    rev: {tag-version}
    hooks:
      - id: add-coauthors
        stages: ["prepare-commit-msg"]
```
And install with: `pre-commit install --hook-type prepare-commit-msg`.

Removing the above snippet and running `git commit` will uninstall the pre-commit hook

### Revert back to default setup

1. Remove relevant scripts `prepare-commit-msg` file

## Workflow / Usage

With git-mob, the primary author will always be the primary user of the computer.
Set your author info in git if you haven't done so before.

```
$ git config --global user.name "Jane Doe"
$ git config --global user.email "jane@example.com"
```

To keep track of potential co-authors, git-mob uses a JSON file called `~/.git-coauthors`.
Here's a template of its structure.

```
{
  "coauthors": {
    "<initials>": {
      "name": "<name>",
      "email": "<email>"
    }
  }
}
```

Start by adding a few co-authors that you work with.

```
$ cat <<-EOF > ~/.git-coauthors
{
  "coauthors": {
    "ad": {
      "name": "Amy Doe",
      "email": "amy@findmypast.com"
    },
    "bd": {
      "name": "Bob Doe",
      "email": "bob@findmypast.com"
    }
  }
}
EOF
```

You're ready to create your mob. Tell git-mob you're pairing with Amy by using her initials.

```
$ git mob ad
Jane Doe <jane@example.com>
Amy Doe <amy@example.com>
```

Commit like you normally would.
You should see `Co-authored-by: Amy Doe <amy@example.com>` appear at the end of the commit message.

Let's add Bob to the group to create a three-person mob.

```
$ git mob ad bd
Jane Doe <jane@example.com>
Amy Doe <amy@example.com>
Bob Doe <bob@example.com>
```

Once you're done mobbing, switch back to developing solo.<sup>\*</sup>

```
$ git solo
Jane Doe <jane@example.com>
```

## More commands

### List all co-authors

Check which co-authors you have available in your `.git-coauthors` file.

```
$ git mob --list
jd Jane Doe jane@example.com
ad Amy Doe amy@example.com
bd Bob Doe bob@example.com
```

### Overwrite the main author

Overwrite the current author which could be useful for pairing on different machines

If the current author is: **Bob Doe**

```
$ git mob -o jd ad
jd Jane Doe jane@example.com
ad Amy Doe amy@example.com
```

Now the author has changed to **Jane Doe**.

### Add co-author

Add a new co-author to your `.git-coauthors` file.

```
$ git add-coauthor bb "Barry Butterworth" barry@butterworth.org
```

### Delete co-author

Delete a co-author from your `.git-coauthors` file.

```
$ git delete-coauthor bb
```

### Edit co-author

Edit a co-author's details in your `.git-coauthors` file.

```
$ git edit-coauthor bb --name="Barry Butterworth" --email="barry@butterworth.org"
$ git edit-coauthor bb --name="Barry Butterworth"
$ git edit-coauthor bb --email="barry@butterworth.org"
```

### Suggest co-authors base on current repo

Suggest some co-authors to add based on existing committers to your
current repo

```
$ git suggest-coauthors
```

### Add initials of current mob to your prompt

#### Bash

Add the initials to `PS1`, in `~/.bashrc`

```bash
function git_initials {
  local initials=$(git mob-print --initials)
  if [[ -n "${initials}" ]]; then
    echo " [${initials}]"
  fi
}

export PS1="\$(pwd)\$(git_initials) -> "
```

#### Fish

Add the following functions to `.config/fish/config.fish`

```fish
function git_initials --description 'Print the initials for who I am currently pairing with'
  set -lx initials (git mob-print --initials)
  if test -n "$initials"
    printf ' [%s]' $initials
  end
end

function fish_prompt
  printf "%s%s ->" (pwd) (git_initials)
end
```

<sup>\* [If you have git-duet installed, you'll need to uninstall it](https://github.com/findmypast-oss/git-mob/issues/2) since it conflicts with the git-solo command.</sup>

Find out more with `git mob -h`
