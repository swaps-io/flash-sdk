import { ExclusiveAction, ExclusivePool } from '../src/helper/exclusive';
import { Duration } from '../src/model/time/duration';

test('Executes exclusive pool sequentially', async () => {
  const pool = new ExclusivePool();

  {
    let executed = false;
    await pool.execute(async () => {
      executed = true;
    });
    expect(executed).toBeTruthy();
  }

  {
    let executed = false;
    await pool.execute(async () => {
      executed = true;
    });
    expect(executed).toBeTruthy();
  }

  {
    let executed = false;
    await pool.execute(async () => {
      executed = true;
    });
    expect(executed).toBeTruthy();
  }
});

test('Executes exclusive pool promises sequentially', async () => {
  const pool = new ExclusivePool();

  {
    let executed = false;
    const promise = async (): Promise<void> => {
      executed = true;
    };
    await pool.execute(() => promise());
    expect(executed).toBeTruthy();
  }

  {
    let executed = false;
    const promise = async (): Promise<void> => {
      executed = true;
    };
    await pool.execute(() => promise());
    expect(executed).toBeTruthy();
  }

  {
    let executed = false;
    const promise = async (): Promise<void> => {
      executed = true;
    };
    await pool.execute(() => promise());
    expect(executed).toBeTruthy();
  }
});

test('Executes exclusive pool parallel promises parallel', async () => {
  const pool = new ExclusivePool();

  let executed0 = false;
  let executed1 = false;
  let executed2 = false;
  let executed3 = false;
  let executed4 = false;

  const execute = async (action: ExclusiveAction<void>): Promise<void> => {
    try {
      await pool.execute(action);
    } catch {
      // Ignore
    }
  };

  await Promise.all([
    execute(async () => {
      await Duration.fromMilliseconds(125).sleep();

      executed0 = true;
      expect(executed1).toBeFalsy();
      expect(executed2).toBeFalsy();
      expect(executed3).toBeFalsy();
      expect(executed4).toBeFalsy();
    }),
    execute(async () => {
      await Duration.fromMilliseconds(250).sleep();

      expect(executed0).toBeTruthy();
      executed1 = true;
      expect(executed2).toBeFalsy();
      expect(executed3).toBeFalsy();
      expect(executed4).toBeFalsy();
    }),
    execute(async () => {
      expect(executed0).toBeTruthy();
      expect(executed1).toBeTruthy();
      executed2 = true;
      expect(executed3).toBeFalsy();
      expect(executed4).toBeFalsy();

      throw new Error('Test exception');
    }),
    execute(async () => {
      await Duration.fromMilliseconds(70).sleep();

      expect(executed0).toBeTruthy();
      expect(executed1).toBeTruthy();
      expect(executed2).toBeTruthy();
      executed3 = true;
      expect(executed4).toBeFalsy();
    }),
    execute(async () => {
      await Duration.fromMilliseconds(500).sleep();

      expect(executed0).toBeTruthy();
      expect(executed1).toBeTruthy();
      expect(executed2).toBeTruthy();
      expect(executed3).toBeTruthy();
      executed4 = true;
    }),
  ]);

  expect(executed0).toBeTruthy();
  expect(executed1).toBeTruthy();
  expect(executed2).toBeTruthy();
  expect(executed3).toBeTruthy();
  expect(executed4).toBeTruthy();
});

test('Continues execute exclusive pool after exception', async () => {
  const pool = new ExclusivePool();

  {
    let caught = false;
    try {
      await pool.execute(async () => {
        throw new Error();
      });
    } catch {
      caught = true;
    }
    expect(caught).toBeTruthy();
  }

  {
    let executed = false;
    await pool.execute(async () => {
      executed = true;
    });
    expect(executed).toBeTruthy();
  }
});

export default {};
