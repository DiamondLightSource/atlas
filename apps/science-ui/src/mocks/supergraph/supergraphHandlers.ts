import { graphql } from "msw/graphql";
import { HttpResponse } from "msw";
import { activeVisits } from "./instrumentSession";

const supergraph = graphql.link("/api/supergraph");

export const supergraphHandlers = [
  supergraph.query("GetInstrumentSessionsQuery", () =>
    HttpResponse.json(activeVisits),
  ),
];
