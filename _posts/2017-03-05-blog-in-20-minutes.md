---
layout: post
title: "Blog in 20 minutes"
categories: [Blog in 20 minutes]
tags: [config, composer, database, latte, forms]
author: paveljanda
order: "1"
---

There are plenty of frameworks that start their tutorials with a example blog-like application. The reason for it is pretty obvious - you get in touch with powerful tools like forms, database layer and templating engine but it is still simple enough so you don't get stuck with `DIC` configuration and other more complex topics.

Let's get stared, shall we?

<!--more-->

## Installation

Create and empty nette project: `composer create-project nette/web-project blog`. If you are running nette on unix based system, you might want to alter the permissions of `log` and `temp` dir: `chmod -R a+rw log temp`.
Now you can go to the web browser and open your nette application (my url is now `http://localhost/blog/www/`).

![Running application]({{ site.url }}/assets/2017-03-05-blog-in-20-minutes-1.png)


## Database

### Configuration

Now that your application is up and running, we will configure a database connection. There are plenty of great database layers. You are maybe familiar with Doctrine. Sure you can use it. Or the native Nette Database. Or some other library. I will walk you through all popular database layers in upcoming articles. Now we will use `Nette Database` and MySql database. Open your configuration local file (`app/config/config.local.neon`). There is already some predefined database configuration, probably looking like this:

{% highlight neon %}
parameters:


database:
    dsn: 'mysql:host=127.0.0.1;dbname=test'
    user:
    password:
{% endhighlight %}

You can get rid of the `parameters` section, it does nothing because it is empty. And change the database section to use your local database:

{% highlight neon %}
database:
    dsn: 'mysql:host=127.0.0.1;dbname=blog'
    user: root
    password:
{% endhighlight %}

### Schema

And create a database schema:

{% highlight sql %}

-- Create syntax for TABLE 'article'
CREATE TABLE `article` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `text` text,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'comment'
CREATE TABLE `comment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `article_id` int(11) unsigned NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `text` text,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `article_comment` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

{% endhighlight %}

### Nette\Database vs Nette\Database\Table

<i class="fa fa-info"></i> **Notice!** There are couple of different ways of how to call database queries in `nette/database` package. You should first have a look at documentation of:

- [database][link-nette-database]
- [database table][link-nette-database-table]
- [database selection][link-nette-database-selection]
- [database active row][link-nette-database-active-row]


## Presenter

The Presenter class should be capable of obtaining articles from database and passing them to the template. Also, there will be an article detail with full article's text and a comment form (which we will add later).

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette\Application\ForbiddenRequestException;
use Nette\Application\UI\Presenter;
use Nette\Database\Context;
use Nette\Database\Table\ActiveRow;

class HomepagePresenter extends Presenter
{

    /**
     * @var Context
     */
    private $db;

    /**
     * @var ActiveRow|NULL
     */
    private $article;


    public function __construct(Context $db)
    {
        $this->db = $db;
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

}
{% endhighlight %}


## Template

Templates are rendered using `Latte` engine. All parameters given by the presenter are available in the template. Let's modify the homepage template for displaying all blog articles (`app/presenters/templates/Homepage/default.latte`):

{% highlight latte %}
{block content}
    <h1>My blog posts</h1>

    {foreach $articles as $article}
        <article>
            <h2><a n:href="detail, $article->id">{$article->title}</a></h2>
            <small>{$article->date|date:'j. n. Y'}</small>
            <p>{$article->text|truncate:200, '...'}</p>
        </article>
    {/foreach}
{/block}
{% endhighlight %}

For the article detail we have to create a new file - `app/presenters/templates/Homepage/detail.latte`:

{% highlight latte %}
{block content}
    <h1>{$article->title}</h1>

    <small>{$article->date|date:'j. n. Y'}</small>
    <p>{$article->text}</p>
{/block}
{% endhighlight %}

Great! There we have articles and an article detail. We should add a form for commenting particular article and comments list to each article.


## Comments

Article comments will be in the template of the article detail. Let's open that file (`app/presenters/templates/Homepage/detail.latte`) again. We will add articles list and also a form for submitting new comment:

{% highlight latte %}
{block content}
    <h1>{$article->title}</h1>

    <small>{$comment->date|date:'j. n. Y'}</small> &bull; {$comment->name}</>
    <p>{$article->text}</p>

    <article>
        <h2>Comments</h2>

        {var $comments = $article->related('comment')}

        {if $comments->count()}
            <ul>
                <li n:foreach="$comments as $comment">
                    <small>{$comment->date|date:'j. n. Y'}</small>
                    <br>
                    {$comment->text}
                </li>
            </ul>

            {control commentForm}
        {/if}
    </article>
{/block}
{% endhighlight %}

Now the application should tell you that the component commentForm does not exist. It sure does not. We will create it in the `app/presenters/HomepagePresenter` class:

{% highlight php %}
<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette\Application\ForbiddenRequestException;
use Nette\Application\UI\Form;
use Nette\Application\UI\Presenter;
use Nette\Database\Context;
use Nette\Database\Table\ActiveRow;
use Nette\Utils\ArrayHash;

class HomepagePresenter extends Presenter
{

  /**
   * @var Context
   */
  private $db;

  /**
   * @var ActiveRow|NULL
   */
  private $article;


  public function __construct(Context $db)
  {
    $this->db = $db;
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

There you go, we created a simple blog application. You can find the source code [here][link-example]. It is not so pretty to create forms in presenter class so we will talk about components in next chapter.

[link-nette-database]: https://doc.nette.org/en/2.4/database
[link-nette-database-table]: https://doc.nette.org/en/2.4/database-table
[link-nette-database-selection]: https://doc.nette.org/en/2.4/database-selection
[link-nette-database-active-row]: https://doc.nette.org/en/2.4/database-activerow
[link-example]: https://github.com/monday-factory/nette-tutors-examples/tree/master/2017-03-05-blog-in-20-minutes/blog
