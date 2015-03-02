var _ = require("lodash"),
    inProductionLikeEnvironment,
    hbs,
    helpers;


// default, can be over-ridden by user
inProductionLikeEnvironment = function () {
  return process.env.NODE_ENV !== "development" &&
      process.env.NODE_ENV !== "test";
};

function initializeHelpers(systemsHandlebars, iPLE) {
  if (iPLE) {
    inProductionLikeEnvironment = iPLE;
  }

  hbs = systemsHandlebars;
  helpers.registerHelpers();

  return helpers;
}

helpers = {
  installResourceLoadingErrorCheckFunctions: function () {
    if (inProductionLikeEnvironment()) {
      return "";
    }

    return new hbs.SafeString([
      "<script type=\"text/javascript\">",
      "  resourcesWeShouldHaveLoaded = {};",

      "  function loadingCss(nickname) {",
      "    resourcesWeShouldHaveLoaded[nickname] = false;",
      "    var el = document.getElementById(nickname + '-load');",
      "    el.onload = function () { resourcesWeShouldHaveLoaded[nickname] = 'loaded'; };",
      "  }",

      "  function loadingJs(nickname, url) {",
      "    resourcesWeShouldHaveLoaded[nickname] = false;",
      "    var el = document.getElementById(nickname + '-load');",
      "    el.onload = function () { resourcesWeShouldHaveLoaded[nickname] = 'loaded'; };",
      "    el.src = url;",
      "  }",
      "</script>"
    ].join(""));
  },

  loadCss: function (nickname, options) {
    if (inProductionLikeEnvironment()) {
      return new hbs.SafeString("<link rel=\"stylesheet\" href=\"" + options.hash.production_path + "\">");
    } else {
      return new hbs.SafeString([
        "<link rel=\"stylesheet\" id=\"" + nickname + "-load\" href=\"" + options.hash.development_path + "\">",
        "<script type=\"text/javascript\">loadingCss('" + nickname + "');</script>"
      ].join(""));
    }
  },

  loadJs: function (nickname, options) {
    if (inProductionLikeEnvironment()) {
      return new hbs.SafeString("<script src=\"" + options.hash.production_path + "\"></script>");
    } else {
      return new hbs.SafeString([
        "<script id=\"" + nickname + "-load\"></script>",
        "<script type=\"text/javascript\">loadingJs('" + nickname + "', '" + options.hash.development_path + "');</script>"
      ].join(""));
    }
  },

  performResourceLoadingErrorCheck: function () {
    if (inProductionLikeEnvironment()) {
      return "";
    }

    return new hbs.SafeString([
      "<script type=\"text/javascript\">",
      "  window.onload = function () {",
      "    for (var key in resourcesWeShouldHaveLoaded) {",
      "      if (resourcesWeShouldHaveLoaded.hasOwnProperty(key) &&",
      "          resourcesWeShouldHaveLoaded[key] !== 'loaded') {",
      "        console.log(\"Error: didn't load asset nicknamed '\" + key + \"' by completion of page load.  Something is probably wrong.\");",
      "      }",
      "    }",
      "  };",
      "</script>"
    ].join(""));
  },

  registerHelpers: function () {
    var keys = _.difference(_.keys(helpers), ["registerHelpers"]);
    _.each(keys, function (key) {
      hbs.registerHelper(key, helpers[key]);
    });
  }
};

module.exports = initializeHelpers;