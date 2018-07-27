---
title: About yarn.lock & package-lock.json
date: 2018-06-22 22:46:16
tags:
  - javaScript
---

# What is a lock?

Yarn uses its own design format, which is a bit like YAML (the standard YAML will be used in Yarn 2.0). The line at the beginning of `#` is a comment.

## lockfile version

The second line of each `yarn.lock` is `# yarn lockfile v1`. This indicates the first version of the lockfile. The record version is for the purpose of updating the syntax or semantics of the lockfile in the future. Once the lockfile is updated in the future, the version number is added, and Yarn can make different actions according to different versions, thus ensuring backward compatibility.

## Field Interpretation

All package information is listed under the `yarn.lock` file and sorted alphabetically. I just find a bag for explanation. E.g:

```yaml
Boom@5.x.x:
  Version "5.2.0"
  Responsible "https://registry.yarnpkg.com/boom/-/boom-5.2.0.tgz#5dd9da6ee3a5f302077436290cb717d3f4a54e02"
  Dependencies:
    Hoek "4.x.x"
```
