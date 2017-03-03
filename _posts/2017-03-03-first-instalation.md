---
layout: post
title: "First instalation"
categories: [Quick start]
tags: [config, composer]
author: paveljanda
order: "2"
---

First things first! Learn how to install **Nette** **framework** using [Composer][link-composer]. Composer is now the best and the only tool for managing dependencies in PHP world. If you're not already familiar with it, take a look at it's [web][link-composer].

Nette framework is available also as a [ZIP archive][link-download-nette-zip], but we shall continue the composer way..

<!--more-->

## Composer packages

**Nette Framework** is distributed in several composer packages. The reason is - you don't have to use the whole framework every time, just particular parts of it. Does your PHP application needs only a templating engine and forms? No problem, just require `latte/latte` and `nette/forms`.

Here is a complete list of nette packages:

`nette/application`<br>
`nette/bootstrap`<br>
`nette/caching`<br>
`nette/component-model`<br>
`nette/database`<br>
`nette/di`<br>
`nette/finder`<br>
`nette/forms`<br>
`nette/http`<br>
`nette/mail`<br>
`nette/neon`<br>
`nette/php-generator`<br>
`nette/reflection`<br>
`nette/robot-loader`<br>
`nette/safe-stream`<br>
`nette/security`<br>
`nette/tokenizer`<br>
`nette/utils`<br>
`latte/latte`<br>
`tracy/tracy`<br>
`nette/tester`<br>

## Hello

Let's do it! Let's create a `Hello world` Nette application. You have a couple of choices how to start your project.

### nette/web-project &nbsp;<i class="fa fa-hand-o-left"></i>

Start by typing `composer create-project nette/web-project` in your command line. New application is created in `web-project` directory. You can view the application running in the web browser. When starting nette application on unix-based systems, you will probably have to change the permissions of `log` and `temp` directories.

**nette/web-project** is simple nette application skeleton. No forms are prepared for your, no security layer, nothing, just the basic project structure.

<i class="fa fa-info"></i> **Notice!** We will be using `nette/web-project` as a starter project in all further articles and examples.

### nette/sandbox

On the other hand, `nette/sandbox` is packed with some examples. You can find here a form, a tiny tiny security layer and other snippets of code. I the `examples` directory there are more examples of standalone applications.


### From scrach

Sure you can start the project totally from scratch (or maybe you are migrating old project and you want to use Nette framework). In that case, you should start with the businesss logic you want to migrate first. Is it `nette/database`? Or maybe the firt step should be the templating engine Latte (`latte/latte`)?

I strongly recommend you to begin with vendor `tracy/debugger`. **Tracy** is a pretty sofisticated debugger tool. It will help you with tracing exceptions, dumping variables, logging errors and exceptions, and more. Make a couple of minutes and take a look on Tracy homepage: [tracy.nette.org][link-tracy].


[link-composer]: https://getcomposer.org/
[link-download-nette-zip]: https://nette.org/en/download
[link-tracy]: https://tracy.nette.org/en/
