import { importProductsFileHandler } from "../handlers/importProductsFile";

const mockGetConfig = jest.fn();

jest.mock("../utils", () => ({
  __esModule: true,
  ...jest.requireActual("../utils"),
  getConfig: () => mockGetConfig,
}));

describe("importProductsFileHandler", () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({
      region: "region",
      assetFromFolderName: "assetFromFolderName",
      assetToFolderName: "assetToFolderName",
      bucketName: "bucketName",
    });
  });

  it("Should return response", async () => {
    expect(
      await importProductsFileHandler({ pathParameters: "1" })
    ).toBeTruthy();
  });
});
