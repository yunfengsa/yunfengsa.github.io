# Overview

[Octopress](http://octopress.org/) Theme for [k.ernel.org](http://k.ernel.org/)

# Install

```sh
git submodule add https://github.com/gluttony/object-octopress-theme.git .themes/object
rake install["object"]
```

The sidebar of the theme has three columns by default. The section element of three asides should have "first odd", "even", "odd" class attribute. Reference to the three asides used by this theme:  [recent_posts.html](https://github.com/gluttony/object-octopress-theme/blob/master/source/_includes/asides/recent_posts.html), [twitter.html](https://github.com/gluttony/object-octopress-theme/blob/master/source/_includes/asides/twitter.html), [flickr.html](https://github.com/gluttony/object-octopress-theme/blob/master/source/_includes/custom/asides/flickr.html).
The flickr.html was forked from [amelandri](https://github.com/amelandri)'s [Octopress-Flickr-Aside](https://github.com/amelandri/Octopress-Flickr-Aside) with modifications.
Do not forget to modify the _config.yml file to include these asides:

```yaml
default_asides: [asides/recent_posts.html, asides/twitter.html, custom/asides/flickr.html]
```

# Screenshot

![http://k.ernel.org/](https://raw.github.com/gluttony/object-octopress-theme/master/screenshot.png)
