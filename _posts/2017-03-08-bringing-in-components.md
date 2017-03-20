---
layout: post
title: "Bringing in components"
categories: [Blog in 20 minutes]
tags: [config, latte, forms, components]
author: paveljanda
order: "3"
comments: true
---

Creating forms in presenters is simple, fast and effective. But it's definitely not pretty. Nette comes with components. You can encapsulate many semantically related stuff into one component and render this component wherever you need it to render. It has its own logic and also a template.

The more time you will spend with Nette the more you'll leave your presenters empty and build your web application using a bunch of **reusable** components. There will exist a component for cart, component for contact form, for login... I think you know you got my point.

<!--more-->

Start with cloning the repository we created in the <a href="{{ site.baseurl }}{% post_url 2017-03-05-blog-in-20-minutes %}
">previous</a> article. You can find it on [github][link-example].

What are we going to do:

- Create a component
- Move the article comments part into one component
- Create another component in the existing comment component, just for fun

## UI\Component

We already know how to create component from the Nette Framework [documentation][link-nette]. As I wrote, we should move the comment form factory to the newly created component (`app/components/CommentsControl/CommentsControl.php`):

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Components\CommentsControl;

use Nette\Application\UI\Control;
use Nette\Application\UI\Form;
use Nette\Database\Context;
use Nette\Utils\ArrayHash;

class CommentsControl extends Control
{

  /**
   * @var Context
   */
  private $db;


  public function __construct(Context $db)
  {
    $this->db = $db;
  }


  public function render(): void
  {
    $this->getTemplate()->render(__DIR__ . '/templates/commentsControl.latte');
  }


  public function createComponentCommentForm(): Form
  {
    $form = new Form;

    $form->addHidden('article_id', $this->article->id);
    $form->addText('name', 'Name')->setRequired();
    $form->addTextarea('text', 'Comment text')->setRequired();
    $form->addSubmit('submit', 'Send');

    $form->onSuccess[] = function(Form $form, ArrayHash $values): void {
      $this->db->table('comment')->insert([
        'article_id' => $values->article_id,
        'name' => $values->name,
        'text' => $values->text,
        'date' => new \DateTime
      ]);

      $this->flashMessage('Article added, thank you!');
      $this->redirect('this');
    };

    return $form;
  }

}
{% endhighlight %}

That looks great but there is one issue (redirect in success callback). Components cannot redirect the page. But presenters can. Do not worry, bellow are shown two ways how to do that in Component

{% highlight php %}
<?php

$form->onSuccess[] = function(Form $form, ArrayHash $values): void {
  // ...

  $this->getParent()->redirect('this');
  // Or:
  $form->getPresenter()->redirect('this');
};
{% endhighlight %}

But that means that components are not reusable. Solution, anybody? Ok, let me tell you. Nette does have an elegant solution - events hidden in Nette\SmartObject trait.

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Components\CommentsControl;

use Nette\Application\UI\Control;
use Nette\Application\UI\Form;
use Nette\Database\Context;
use Nette\Utils\ArrayHash;

class CommentsControl extends Control
{

  /**
   * @var callable[]
   */
  public $onCommentAdded = [];

  /**
   * @var Context
   */
  private $db;


  public function __construct(Context $db)
  {
    $this->db = $db;
  }


  public function render(): void
  {
    $this->getTemplate()->render(__DIR__ . '/templates/commentsControl.latte');
  }


  public function createComponentCommentForm(): Form
  {
    $form = new Form;

    $form->addHidden('article_id', $this->article->id);
    $form->addText('name', 'Name')->setRequired();
    $form->addTextarea('text', 'Comment text')->setRequired();
    $form->addSubmit('submit', 'Send');

    $form->onSuccess[] = function(Form $form, ArrayHash $values): void {
      $this->db->table('comment')->insert([
        'article_id' => $values->article_id,
        'name' => $values->name,
        'text' => $values->text,
        'date' => new \DateTime
      ]);

      $this->flashMessage('Article added, thank you!');

      $this->onCommentAdded();
    };

    return $form;
  }

}
{% endhighlight %}

The template (`app/components/CommentsControl/templates/commentsControl.latte`) of this component will now have its own form and also its own flash messages:

{% highlight latte %}
<h2>Comments</h2>

<div n:foreach="$flashes as $flash" n:class="flash, $flash->type">{$flash->message}</div>

{var $comments = $article->related('comment')}

{if $comments->count()}
  <ul>
    <li n:foreach="$comments as $comment">
      <small>{$comment->date|date:'j. n. Y'} &bull; {$comment->name}</small>
      <br>
      {$comment->text}
    </li>
  </ul>
{/if}

{control commentForm}
{% endhighlight %}

Great, componenet is ready, we can render this component in presenter template:

{% highlight latte %}
{block content}
  <h1>{$article->title}</h1>

  <small>{$article->date|date:'j. n. Y'}</small>
  <p>{$article->text}</p>

  <article>
    {control commentsControl}
  </article>
{/block}
{% endhighlight %}

And created in presenter class:

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette\Application\ForbiddenRequestException;
use Nette\Application\UI\Presenter;
use Nette\Database\Context;
use Nette\Database\Table\ActiveRow;
use App\Components\CommentsControl\ICommentsControlFactory;

class HomepagePresenter extends Presenter
{

  /**
   * @var Context
   */
  private $db;

  /**
   * @var ICommentsControlFactory
   */
  private $commentsControlFactory;

  /**
   * @var ActiveRow|NULL
   */
  private $article;


  public function __construct(Context $db, ICommentsControlFactory $commentsControlFactory)
  {
    $this->db = $db;
    $this->commentsControlFactory = $commentsControlFactory;
  }


  public function renderDefault(): void
  {
    $this->getTemplate()->articles = $this->db->table('article')->order('id DESC');
  }


  public function actionDetail(int $id): void
  {
    $this->article = $this->db->table('article')->get($id);

    if (!$this->article) { // Article was not found
      throw new ForbiddenRequestException;
    }
  }


  public function renderDetail(): void
  {
    $this->getTemplate()->article = $this->article;
  }


  public function createComponentCommentsControl()
  {
    $control = $this->commentsControlFactory->create($this->article);

    $control->onCommentAdded[] = function() {
      $this->redirect('this');
    };

    return $control;
  }

}
{% endhighlight %}

Ha! The second argument of the `HomepagePresenter` constructor is an object - automatically generated factory for interface `ICommentsControlFactory` (`app/components/CommentsControl/ICommentsControlFactory.php`):

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Components\CommentsControl;

use Nette\Database\Table\ActiveRow;

interface ICommentsControlFactory
{

  public function create(ActiveRow $article): CommentsControl;

}
{% endhighlight %}

The only remaining thing is to register the generated component factory into the `services` section of the `config.neon` file:

{% highlight neon %}
application:
  errorPresenter: Error
  mapping:
    *: App\*Module\Presenters\*Presenter


services:
  router: App\RouterFactory::createRouter
  - App\Components\CommentsControl\ICommentsControlFactory
{% endhighlight %}

## Component in component

You can make the component chain as long as you want to. I will make a component from the comment detail. `app/components/CommentsControl/templates/commentsControl.latte`:

{% highlight latte %}
<h2>Comments</h2>

<div n:foreach="$flashes as $flash" n:class="flash, $flash->type">{$flash->message}</div>

{var $comments = $article->related('comment')}

{if $comments->count()}
  <ul>
    <li n:foreach="$comments as $comment">
      {control commentDetail, $comment}
    </li>
  </ul>
{/if}

{control commentForm}
{% endhighlight %}

`app/components/CommentDetailControl/CommentDetailControl.php`:

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Components\CommentDetailControl;

use Nette\Application\UI\Control;
use Nette\Database\Table\ActiveRow;

class CommentDetailControl extends Control
{

  public function render(ActiveRow $comment): void
  {
    $this->getTemplate()->comment = $comment;

    $this->getTemplate()->render(__DIR__ . '/templates/commentDetailControl.latte');
  }

}
{% endhighlight %}

`app/components/CommentDetailControl/ICommentDetailControlFactory.php`:

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Components\CommentDetailControl;

interface ICommentDetailControlFactory
{

  public function create(): CommentDetailControl;

}
{% endhighlight %}

`app/components/CommentDetailControl/templates/commentDetailControl.latte`:

{% highlight latte %}
<small>{$comment->date|date:'j. n. Y'} &bull; {$comment->name}</small>
<br>
{$comment->text}
{% endhighlight %}

`app/config/config.neon`:

{% highlight neon %}
application:
  errorPresenter: Error
  mapping:
    *: App\*Module\Presenters\*Presenter


services:
  router: App\RouterFactory::createRouter
  - App\Components\CommentsControl\ICommentsControlFactory
  - App\Components\CommentDetailControl\ICommentDetailControlFactory
{% endhighlight %}

{% highlight latte %}
{% endhighlight %}

You can view the complete application code on [github][link-example].


[link-example]: https://github.com/monday-factory/nette-tutors-examples/tree/master/2017-03-08-bringing-in-components/blog
[link-nette]: https://nette.org/en/
