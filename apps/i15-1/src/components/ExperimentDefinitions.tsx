import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

import type { TypedDocumentNode } from "@apollo/client";

type ExperimentDefinitionNode = {
  name: string;
  data: string;
};

type SampleNode = {
  name: string;
  data: string;
};

type ExperimentNode = {
  name: string;
  sample: SampleNode;
  experimentDefinition: ExperimentDefinitionNode;
};

// TODO: Autogenerate these from the schema, see https://github.com/DiamondLightSource/atlas/issues/63
type GetExperimentQueryData = {
  instrumentSession: {
    experiments: {
      edges: {
        node: ExperimentNode;
      }[];
    };
  };
};

type GetExperimentQueryVariables = {
  proposal: number;
  session: number;
};

const GET_EXPERIMENTS: TypedDocumentNode<
  GetExperimentQueryData,
  GetExperimentQueryVariables
> = gql`
  query GetSessionPlaylist($proposal: Int!, $session: Int!) {
    instrumentSession(
      proposalNumber: $proposal
      instrumentSessionNumber: $session
    ) {
      experiments {
        edges {
          node {
            name
            sample {
              name
              data
            }
            experimentDefinition {
              name
              data
            }
          }
        }
      }
    }
  }
`;

export function ExperimentList() {
  const { data, loading, error } = useQuery(GET_EXPERIMENTS, {
    variables: {
      proposal: 44163,
      session: 3,
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const experiments = data?.instrumentSession.experiments.edges || [];

  return (
    <ul>
      {experiments.map((edge, i) => (
        <li key={i}>{edge.node.name}</li>
      ))}
    </ul>
  );
}
