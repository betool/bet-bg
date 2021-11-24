export const extensionizerMockValues = {
  runtime: {
    getUrl: '1',
  },
};

const extensionizer = {
  runtime: {
    getURL: jest.fn().mockReturnValue(extensionizerMockValues.runtime.getUrl),
  },
};

export default extensionizer;
