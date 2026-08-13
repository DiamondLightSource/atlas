import { render, screen } from "@atlas/vitest-conf";
import { DevicePanel } from "./DevicePanel";
import type { Device } from "@atlas/blueapi";
const mockDevicesData: Device[] = [
  { name: "detector-1", protocols: [{ name: "detector", types: [] }] },
  { name: "motor-x", protocols: [{ name: "motor", types: [] }] },
  { name: "motor-y", protocols: [{ name: "motor", types: [] }] },
];

describe("DevicePanel", () => {
  it("renders the devices panel with title", () => {
    render(<DevicePanel devices={mockDevicesData} />);

    expect(screen.getByText(/Connected Devices/)).toBeInTheDocument();
  });

  it("displays the correct device count", () => {
    render(<DevicePanel devices={mockDevicesData} />);

    expect(screen.getByText(/Connected Devices \(3\)/)).toBeInTheDocument();
  });

  it("renders all devices as chips", () => {
    render(<DevicePanel devices={mockDevicesData} />);

    expect(screen.getByText("detector-1")).toBeInTheDocument();
    expect(screen.getByText("motor-x")).toBeInTheDocument();
    expect(screen.getByText("motor-y")).toBeInTheDocument();
  });

  it("shows empty state when no devices are present", () => {
    render(<DevicePanel devices={[]} />);

    expect(screen.getByText(/Connected Devices \(0\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/No devices detected on the worker/),
    ).toBeInTheDocument();
  });
});
