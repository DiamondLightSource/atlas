import { graphql } from "relay-runtime";

/*
 * Source for relay-compiler only. Runtime code imports the generated artifact
 * from ./__generated__ directly, so apps consuming this package don't need
 * babel-plugin-relay to transform it (and apps without Relay can still use
 * the fixed sessions list).
 */
export const instrumentSessionQuery = graphql`
  query InstrumentSessionQuery($instrumentKey: String!) {
    instrumentByKey(key: $instrumentKey) {
      instrumentSessions(filterBy: { state: { eq: IN_PROGRESS } }) {
        edges {
          node {
            instrumentSessionReference
          }
        }
      }
    }
  }
`;
