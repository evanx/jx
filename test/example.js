
var moment = require('moment');
var jx = require('../src/jx.js');
var each = jx.each;

var a = {
   hasRelatedStories: function (article) {
      if (article.relatedStories) {
         return article.relatedStories.length > 0;
      }
      return false;
   },
   getDescription: function (article) {
      if (article.description) {
         return article.description;
      }
      return article.title;
   },
   processParagraph: function (paragraph) {
      return paragraph;
   }
};

var h = {
   relatedStoryClicked: function (relatedStory) {
      console.log('relatedStoryClicked');
   }
};

function handler(object, fn, item) {
   for (var prop in object) {
      if (object[prop] === fn) {
         return {name: prop, fn: fn, item: item};
      }
   }
}

exports.renderArticleHtml = function (article) {
   var description = a.getDescription(article);
   return jx.render({
      itemscope: null,
      itemtype: "http://schema.org/Article",
      html: [
         {
            head: [
               {title: article.title},
               {meta: "noindex, nofollow", name: 'robots'},
               {meta: "article", property: "og:type"},
               {meta: "summary_large_image", name: "twitter:card"},
               {meta: "@IOLmobile", name: "twitter:site"},
               {meta: "@IOLmobile", name: "twitter:creator"},
               {meta: description, name: "twitter:description"},
               {meta: article.title, name: "twitter:title"},
               {meta: article.imageLink, name: "twitter:image:src"},
               {meta: article.imageLink, property: "og:image"},
               {meta: article.link, property: "og:url"},
               {meta: article.title, property: "name"},
               {meta: description, property: "description"},
               {meta: article.imageLink, property: "image"},
               {link: "/article.css"}
            ]
         },
         {
            body: [
               {h1: article.title, id: "article-title"},
               {h2: moment().format('Do MMMM YYYY, h:mma', article.published), id: "article-published"},
               {figure: {img: article.imageLink, width: '300px'}},
               each(article.paragraphs, {class: "article-paragraph", p: function (paragraph) {
                     return a.processParagraph(paragraph);
                  }}),
               {id: "article-related-stories",
                  show: a.hasRelatedStories(article),
                  div: [
                     {h2: "Related Stories", class: "article-relatedstories-heading"},
                     {ul: each(article.relatedStories, {
                           li: function (item) {
                              return {a: item.title, href: item.link,
                                 onclick: handler(h, h.relatedStoryClicked, item)
                              }
                           }})}
                  ]
               }
            ]
         },
      ]
   });
}

var article = {
   title: "IOLMobile",
   published: new Date(),
   link: "http://iolmobile.com/",
   imageLink: "http://iolmobile.com/branding/iol/600x600.jpg",
   paragraphs: [
      "IOLmobile is a mobi site",
      "Enjoy!"
   ],
   relatedStories: [
      {title: "IOL desktop site", link: "http://iol.co.za"}
   ]  
};

console.log(exports.renderArticleHtml(article));

/* outputs:
 <html itemscope itemtype="http://schema.org/Article">
 <head>
 <title>IOLMobile</title>
 <meta content="noindex, nofollow" name="robots"/>
 <meta content="article" property="og:type"/>
 <meta content="summary_large_image" name="twitter:card"/>
 <meta content="@IOLmobile" name="twitter:site"/>
 <meta content="@IOLmobile" name="twitter:creator"/>
 <meta content="IOLMobile" name="twitter:description"/>
 <meta content="IOLMobile" name="twitter:title"/>
 <meta content="http://iolmobile.com/branding/iol/600x600.jpg" name="twitter:image:src"/>
 <meta content="http://iolmobile.com/branding/iol/600x600.jpg" property="og:image"/>
 <meta content="http://iolmobile.com/" property="og:url"/>
 <meta content="IOLMobile" property="name"/>
 <meta content="IOLMobile" property="description"/>
 <meta content="http://iolmobile.com/branding/iol/600x600.jpg" property="image"/>
 <link type="text/css" rel="stylesheet" href="/article.css"/>
 </head>
 <body>
 <h1 id="article-title">IOLMobile</h1>
 <h2 id="article-published">16th December 2014, 12:49pm</h2>
 <figure>
 <img src="http://iolmobile.com/branding/iol/600x600.jpg" width="300px"/>
 </figure>
 <p class="article-paragraph">IOLmobile is a mobi site</p>
 <p class="article-paragraph">Enjoy!</p>
 </body>
 </html>
 */
