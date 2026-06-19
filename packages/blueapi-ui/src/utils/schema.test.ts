import type { Plan } from "@atlas/blueapi";
import { sanitisePlan } from "./schema";

describe("sanitiseSchema", () => {
  ((it("replaces unknown JSON types for string when there is an enum provided", () => {
    const plan: Plan = {
      name: "prepare_beamline_for_robot_load",
      description: undefined,
      schema: {
        additionalProperties: false,
        properties: {
          blower: {
            enum: ["blower_z"],
            title: "Blower",
            type: "dodal.devices.beamlines.i15_1.blower.Blower",
          },
          cobra: {
            enum: ["cobra"],
            title: "Cobra",
            type: "dodal.devices.beamlines.i15_1.cobra.Cobra",
          },
        },
        title: "prepare_beamline_for_robot_load",
        type: "object",
      },
    };

    const sanitised = sanitisePlan(plan);
    const schema = sanitised.schema as {
      properties: {
        blower: { type: string };
        cobra: { type: string };
      };
    };

    expect(schema.properties.blower.type).toBe("string");
    expect(schema.properties.cobra.type).toBe("string");
  }),
  it("(perhaps too conservatively) does not replace unknown types when no enum is provided", () => {
    // unsure whether this is a realistic scenario...

    const exoticType = "some.vendor.Device";

    const plan: Plan = {
      name: "Test plan",
      description: "plan with exotic type",
      schema: {
        properties: {
          device: {
            title: "Device",
            type: exoticType,
          },
        },
      },
    };

    const schema = sanitisePlan(plan).schema as {
      properties: {
        device: { type: string };
      };
    };

    expect(schema.properties.device.type).toBe(exoticType);
  })),
    it("recursively sanitises all nodes", () => {
      const typeToReplace = "bluesky.protocols.Movable";
      const matchingNode = {
        enum: ["robot", "stage_y"],
        type: typeToReplace,
      };

      const plan = {
        name: "my plan",
        description: "",
        schema: {
          level1: {
            ...matchingNode,
            level2: {
              ...matchingNode,
            },
          },
        },
      };

      // first a sanity check:
      expect(JSON.stringify(plan)).toContain(typeToReplace);
      // verify type is gone in sanitised schema:
      expect(JSON.stringify(sanitisePlan(plan))).not.toContain(typeToReplace);
    }));
});
