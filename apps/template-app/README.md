# A template to bootstrap new apps using turbo generator

This template provides a minimal app to be used as a starting point to develop beamline/village specific apps.

## How to use the template

From the root of the monorepo, run

```bash
turbo gen workspace -c apps/template-app -d apps/your-app-name
```


## What's included in this template

- A set of commonly used dependencies, such as `sci-react-ui`
- The Home page set up with a minimal Navbar and an example of how to set up routing
