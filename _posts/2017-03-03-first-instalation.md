---
layout: post
title: "First instalation"
categories: [Quick start]
tags: [config, composer]
author: paveljanda
order: "2"
---

First things first! Learn how to install **Nette** **framework** using [Composer][link-composer]. Composer is now the best and the only tool for managing dependencies in PHP world. If you're not already familiar with it yet, take a look at its [web][link-composer].

Nette framework is available also as a [ZIP archive][link-download-nette-zip], but we shall continue the composer way..

<!--more-->

## Composer packages

**Nette Framework** is distributed via several composer packages. The reason is - you don't have to use the whole framework every time, just some particular parts of it. Does your PHP application need only a templating engine and forms? No problem, just require `latte/latte` and `nette/forms`.

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

Let's do it! Let's create a `Hello world` Nette application. You have a couple of options how to start your project.

### nette/web-project &nbsp;<i class="fa fa-hand-o-left"></i>

Start by typing `composer create-project nette/web-project` in your command line. New application is created in a `web-project` directory. You can view the application running in the web browser. When starting nette application on unix-based systems, you will probably have to change the permissions of `log` and `temp` directories.

**nette/web-project** is simple nette application skeleton. No forms are prepared for you, no security layer, just the basic project structure.

<i class="fa fa-info"></i> **Notice!** We will be using `nette/web-project` as a starter project in all further articles and examples.

### nette/sandbox

On the other hand, `nette/sandbox` is packed with some examples. You can find here a form, a tiny tiny security layer and other snippets of code. In the `examples` directory there are more examples of standalone applications.


### From scratch

You can surely start the project completely from scratch (or maybe you are migrating old project and you want to use Nette framework). In that case, you should start with the business logic you want to migrate first. Is it `nette/database`? Or maybe the first step should be the templating engine Latte (`latte/latte`)?

I strongly recommend you to begin with vendor `tracy/debugger`. **Tracy** is a pretty sofisticated debugger tool. It will help you with tracing exceptions, dumping variables, logging errors and exceptions, and more. Take a look at Tracy homepage: [tracy.nette.org][link-tracy].


[link-composer]: https://getcomposer.org/
[link-download-nette-zip]: https://nette.org/en/download
[link-tracy]: https://tracy.nette.org/en/
