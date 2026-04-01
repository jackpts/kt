# klika-tech test task for Y.P.

A Symfony/Webpack/React project created on September 15, 2017, 3:23 pm.

## Install Symfony2

```bash
sudo curl -LsS http://symfony.com/installer -o /usr/local/bin/symfony
sudo chmod a+x /usr/local/bin/symfony
symfony
cd ~
symfony new myproject
```

## If the error:

> simplexml_import_dom() must be available
>
> Install and enable the SimpleXML extension.

Re-check Symfony requirements executing this command:

```bash
php ~/klika-tech/bin/symfony_requirements
```

Try install additional packages:

```bash
php -i | grep simplexml
sudo apt-get install php-xml php7.1-xml php-intl php-fpm php-mbstring php-xmlrpc
```

## Install React

```bash
npm install --save react react-dom babel-loader babel-core babel-preset-es2015 babel-preset-react react-hot-loader react-router webpack jquery
```

## Start local Symfony server

```bash
php ~/klika-tech/bin/console server:start
```

## Get local Symfony server status

```bash
php ~/klika-tech/bin/console server:status
```

## Stop local Symfony server

```bash
php ~/klika-tech/bin/console server:stop
```

## Clearing the cache for the prod environment

```bash
php /home/jacky/klika-tech/bin/console cache:clear --env=prod
```

## Run webpack build in Dev mode

```bash
webpack
```

## Run webpack build in Prod mode (to get optimized app.js [3.4Mb --> 230Kb])

```bash
NODE_ENV='production' webpack -p
```
