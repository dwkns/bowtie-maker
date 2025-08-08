import tailwindcss from 'eleventy-plugin-tailwindcss-4';

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPlugin(tailwindcss, {
    input: 'css/tailwind.css'
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    }
  };
}; 