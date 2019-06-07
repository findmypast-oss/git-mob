# Git Mob ![npm downloads](https://img.shields.io/npm/dm/git-mob.svg) [![npm version](https://badge.fury.io/js/git-mob.svg)](https://www.npmjs.com/package/git-mob) [![build status](https://travis-ci.org/findmypast-oss/git-mob.svg?branch=master)](https://travis-ci.org/findmypast-oss/git-mob)

> A command-line tool for social coding

Includes co-authors in commits when you collaborate on code. Use when pairing with a buddy or mobbing with your team.

Read our blog post to find out why git-mob exists: http://tech.findmypast.com/co-author-commits-with-git-mob

[**New** Git Mob VS Code extension](https://github.com/rkotze/git-mob-vs-code)

![gif showing example usage of git-mob](https://user-images.githubusercontent.com/497458/38682926-2e0cc99c-3e64-11e8-9f71-6336e111005b.gif)

## Install

**Warning: This package hasn't reached v1.0.0 yet. There may be many missing
features, lots of bugs, and the API could change until we reach a stable version.**

git-mob is a CLI tool, so you'll need to install the package globally.

```
npm i -g git-mob
```

By default git-mob will use the `.gitmessage` template to append co-authors.

### Prepare commit msg setup

Do you want the co-authors appended to the message when using the command `git commit -m "commit message"`?

1. `git mob --installTemplate`
1. Add `prepare-commit-msg` to `.git/hooks` and see [hook-examples](https://github.com/findmypast-oss/git-mob/tree/master/hook-examples)

**More details about above ^**

`--installTemplate` This will create a file in your local `.git` folder where it will write the selected co-authors into.

`prepare-commit-msg` will need a script to read the co-authors template. See [hook-examples](https://github.com/findmypast-oss/git-mob/tree/master/hook-examples) folder for working scripts.

The command `git mob-print` will output to stdout the formatted co-authors which you can use in your own git hooks.

### Revert back to default setup

1. `git mob --uninstallTemplate`
1. Remove `prepare-commit-msg` file

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

Check which co-authors you have available in your `.git-coauthors` file.

```
$ git mob --list
jd Jane Doe jane@example.com
ad Amy Doe amy@example.com
bd Bob Doe bob@example.com
```

Add a new coauthor to your `.git-coauthors` file.

```
$ git add-coauthor bb "Barry Butterworth" barry@butterworth.org
```

Delete a new coauthor from your `.git-coauthors` file.

```
$ git delete-coauthor bb
```

Edit a coauthor's details in your `.git-coauthors` file.

```
$ git edit-coauthor bb --name="Barry Butterworth" --email="barry@butterworth.org"
$ git edit-coauthor bb --name="Barry Butterworth"
$ git edit-coauthor bb --email="barry@butterworth.org"
```

Add initials of current mob to `PS1`, in `~/.bashrc`
```bash
function git_initials {
  local initials=$(git mob-print --initials)
  if [[ -n "${initials}" ]]; then
    echo " [${initials}]"
  fi
}

export PS1="\$(pwd)\$(git_initials) -> "
```

<sup>\* [If you have git-duet installed, you'll need to uninstall it](https://github.com/findmypast-oss/git-mob/issues/2) since it conflicts with the git-solo command.</sup>

Find out more with `git mob --help`
