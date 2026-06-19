import type { AxiosInstance } from "axios";
import {
  createTasksApi,
  type TaskListResponse,
  type TaskRequest,
  type TaskResponse,
} from "./tasks";

describe("createTasksApi", () => {
  let client: AxiosInstance;
  let api: ReturnType<typeof createTasksApi>;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    } as unknown as AxiosInstance;

    api = createTasksApi(client);
  });

  it("calls GET /tasks on getAll()", async () => {
    const mockData: TaskListResponse = {
      tasks: [
        {
          task_id: "b48f0314-82f2-434f-896d-7b6b00637eea",
          task: {
            name: "demo_spectroscopy",
            params: {
              total_number_of_scan_points: 25,
              grid_size: 1,
              grid_origin_x: 0,
              grid_origin_y: 0,
              exposure_time: 0.1,
            },
            metadata: {
              instrument_session: "cm44191-1",
              tiled_access_tags: [
                '{"proposal": 44191, "visit": 1, "beamline": "b01-1"}',
              ],
            },
          },
          request_id: null,
          is_complete: false,
          is_pending: true,
          errors: [],
          outcome: { outcome: "success" },
        },
      ],
    };

    (client.get as any).mockResolvedValue({ data: mockData });

    const result = await api.getAll();

    expect(client.get).toHaveBeenCalledWith("/tasks");
    expect(result).toEqual(mockData);
  });

  it("calls GET /tasks/{id} on get(id)", async () => {
    const uuid = "b48f0314-82f2-434f-896d-7b6b00637eea";
    const mockTask = {
      task_id: uuid,
      task: {
        name: "demo_spectroscopy",
        params: {
          total_number_of_scan_points: 25,
          grid_size: 1,
          grid_origin_x: 0,
          grid_origin_y: 0,
          exposure_time: 0.1,
        },
        metadata: {
          instrument_session: "cm44191-1",
          tiled_access_tags: [
            '{"proposal": 44191, "visit": 1, "beamline": "b01-1"}',
          ],
        },
      },
      request_id: null,
      is_complete: false,
      is_pending: true,
      errors: [],
    };

    (client.get as any).mockResolvedValue({ data: mockTask });

    const result = await api.get(uuid);
    expect(client.get).toHaveBeenCalledWith(`/tasks/${uuid}`);
    expect(result).toEqual(mockTask);
  });

  it("calls POST /tasks with body on submit(task)", async () => {
    const taskRequest: TaskRequest = {
      name: "count",
      params: { det: "pco" },
      instrument_session: "cm44191-1",
    };

    const mockResponse: TaskResponse = {
      task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
    };

    (client.post as any).mockResolvedValue({ data: mockResponse });

    const response = await api.submit(taskRequest);

    expect(client.post).toHaveBeenCalledWith("/tasks", taskRequest);
    expect(response).toEqual(mockResponse);
  });

  it("calls DELETE /tasks{id} on delete(id)", async () => {
    const taskId = "7103de3d-b119-464e-859a-74be09be9b2c";
    const mockResponse: TaskResponse = { task_id: taskId };

    (client.delete as any).mockResolvedValue({ data: mockResponse });

    const response = await api.delete(taskId);

    expect(client.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
    expect(response).toEqual(mockResponse);
  });
});
