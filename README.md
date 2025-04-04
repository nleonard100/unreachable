# Find Unreachable URLs

# Setup

```
npm i
```

## Place current status JSON in Input directory

Example current status format 

```json
  "/editions-pricing/platform/feedback-management/": {
    "url": "https://www.salesforce.com/editions-pricing/platform/feedback-management/",
    "valid": true,
    "exception": "",
    "hreflangDef": {
      "aem": [],
      "pb": [],
      "set": [
        {
          "href": "https://www.salesforce.com/editions-pricing/platform/feedback-management/",
          "hreflang": "x-default"
        },
        {
          "href": "https://www.salesforce.com/editions-pricing/platform/feedback-management/",
          "hreflang": "en-us"
        }
      ]
    }
  }


```

example input location

```
input/sitemap-refinement-status.json
```

# Run Crawl for Unreachable URLs

```
node src/findUnreachable.js sitemap-refinement-status.json
```

#  Find Output

The output will be in
```
output/unreachableStatus.json
```

```json
{
  "/products/platform/faq/": {
    "path": "/products/platform/faq/",
    "valid": false,
    "reason": "redirect to https://www.salesforce.com/platform/?bc=HL"
  },

```


