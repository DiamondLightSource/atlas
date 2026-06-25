import type { GetSessionPlaylistQuery } from "./getSessionPlaylistQuery.generated";

/*
The `data` fields for both the sample and the experiment definition are defined in graphQL as
generic `any` data types. In reality, we know what they are based on the beamline that we're on.

You can use the `ExperimentNode` type to enforce this.
*/

type GeneratedNode = NonNullable<
  GetSessionPlaylistQuery["instrumentSession"]
>["experiments"]["edges"][number]["node"];

type WithTypedData<
  TNode extends {
    sample: { data: unknown };
    experimentDefinition: { data: unknown };
  },
  TSampleData,
  TExperimentDefinitionData,
> = Omit<TNode, "sample" | "experimentDefinition"> & {
  sample: Omit<TNode["sample"], "data"> & {
    data: TSampleData;
  };
  experimentDefinition: Omit<TNode["experimentDefinition"], "data"> & {
    data: TExperimentDefinitionData;
  };
};

export type ExperimentNode<TSampleData, TExperimentDefinitionData> =
  WithTypedData<GeneratedNode, TSampleData, TExperimentDefinitionData>;
