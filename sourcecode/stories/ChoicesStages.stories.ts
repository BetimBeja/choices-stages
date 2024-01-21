import type { Meta, StoryObj } from "@storybook/html";
import type {
  IInputs,
  IOutputs,
} from "../ChoicesStages/generated/ManifestTypes";

import { useArgs } from "@storybook/preview-api";

import {
  ComponentFrameworkMockGenerator,
  OptionSetPropertyMock,
  ShkoOnline,
} from "@shko.online/componentframework-mock";

import { ChoicesStages as Component } from "../ChoicesStages/index";

import "../ChoicesStages/css/choices-stages.css";

interface StoryArgs {
  isVisible: boolean;
  isDisabled: boolean;
  choice: number;
}

const rootContainer: () => Meta<StoryArgs>["decorators"] = () => {
  let container: HTMLDivElement | undefined;
  return (Story, context) => {
    if (!container) {
      container = document.createElement("div");
      container.style.margin = "2em";
      container.style.padding = "1em";
      container.style.width = "640px";
      container.style.height = "480px";
      container.style.border = "dotted 1px";
      container.style.resize = "both";
      container.style.overflow = "auto";
      context.parameters["pcf"] = context.parameters["pcf"] || {};
      context.parameters["pcf"].container = container;
    }
    Story();
    return container;
  };
};

const generatorInit: () => Meta<StoryArgs>["decorators"] = () => {
  let mockGenerator:
    | ComponentFrameworkMockGenerator<IInputs, IOutputs>
    | undefined;
  return (Story, context) => {
    const [args, updateArgs] = useArgs<StoryArgs>();
    const rootContainer = context.parameters["pcf"]
      ?.container as HTMLDivElement;
    if (!mockGenerator) {
      const container = document.createElement("div");
      rootContainer.appendChild(container);
      mockGenerator = new ComponentFrameworkMockGenerator(
        Component,
        {
          Choice: OptionSetPropertyMock,
        },
        container
      );

      mockGenerator.context.mode.isControlDisabled = args.isDisabled;
      mockGenerator.context.mode.isVisible = args.isVisible;

      const ChoiceMetadata = mockGenerator.metadata.getAttributeMetadata(
        "!CanvasApp",
        "Choice"
      ) as ShkoOnline.PickListAttributeMetadata;

      ChoiceMetadata.OptionSet.Options = {
        [0]: {
          Label: "Start",
          Value: 0,
        },
        [1]: {
          Label: "Middle",
          Value: 1,
        },
        [2]: {
          Label: "End",
          Value: 2,
        },
      };

      mockGenerator.metadata.upsertAttributeMetadata(
        "!CanvasApp",
        ChoiceMetadata
      );

      mockGenerator.context._SetCanvasItems({
        Choice: args.choice,
      });

      mockGenerator.onOutputChanged.callsFake(({ Choice: choice }) => {
        updateArgs({ choice });
      });

      mockGenerator.ExecuteInit();
      context.parameters["pcf"] = context.parameters["pcf"] || {};
      context.parameters["pcf"].mockGenerator = mockGenerator;
    }
    Story();
    return rootContainer;
  };
};

export default {
  title: "ChoicesStages Component",
  argTypes: {
    choice: {
      options: [0, 1, 2],
      control: {
        type: "select",
        labels: {
          0: "Start",
          1: "Middle",
          2: "End",
        },
      },
    },
    isDisabled: { name: "Disabled", control: "boolean" },
    isVisible: { name: "Visible", control: "boolean" },
  },
  args: {
    choice: 0,
    isDisabled: false,
    isVisible: true,
  },
  render: () => "",
  decorators: [
    (Story, context) => {
      const rootContainer = context.parameters["pcf"]
        ?.container as HTMLDivElement;
      const mockGenerator = context.parameters["pcf"]
        ?.mockGenerator as ComponentFrameworkMockGenerator<IInputs, IOutputs>;
      if (mockGenerator) {
        mockGenerator.context.mode.isVisible = context.args.isVisible;
        mockGenerator.context.mode.isControlDisabled = context.args.isDisabled;
        mockGenerator.context._parameters.Choice._SetValue(context.args.choice);
        mockGenerator.ExecuteUpdateView();
      }
      Story();
      return rootContainer;
    },
    generatorInit(),
    rootContainer(),
  ],
} as Meta<StoryArgs>;

export const ChoicesStagesComponent = {
  parameters: { controls: { expanded: true } },
} as StoryObj<StoryArgs>;
