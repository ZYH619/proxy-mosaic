/*
 * @Description: 后面可能会考虑重构此清除模块
 * @Author: shanchuan
 * @Date: 2024-04-29 11:12:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-09 18:29:36
 */
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { deleteTempData, loadTempData } = require("../temp/index");
const { processOra } = require("@proxy-mosaic/cli-shared-utils");
const { spinner_start, spinner_succeed } = processOra();

// 执行清除
const processExecClean = async (configs) => {
  try {
    const { paths, options } = configs;
    const dataTemp = loadTempData("data");
    let repos = [];

    if (paths.length > 0) {
      repos = getReposByPathsAndSetLast(paths, "isLastRepo");
    }
    if (!repos.length) {
      spinner_succeed("ALL app has been cleaned");
      process.exit(0);
    }

    if (options.config) {
      const forCleanApp = repos.find((v) => v.name === options.cleanConfig);
      forCleanApp.isLastRepo = true;
      // TODO: 执行顺序不能变,后面考虑改造重构一下
      // 删除_pro文件夹下的app
      await cleanFunc(forCleanApp);

      // 删除_output文件夹下的app资源
      await cleanFunc({
        dest: dataTemp[options.cleanConfig],
        name: options.cleanConfig,
        isLastRepo: true,
        isOutPut: true,
        isLoop: false,
      });
    } else {
      // 循环执行clean
      for (const repo of repos) {
        // 删除_pro文件夹下的app
        await cleanFunc(repo);

        // 删除_output文件夹下的app资源
        await cleanFunc({
          ...repo,
          dest: dataTemp[repo.name],
          name: repo.name,
          isOutPut: true,
          isLoop: true,
        });
      }
    }
  } catch (error) {
    console.log("processExecClean ~ error:", error);
  }
};

// 删除操作
const cleanFunc = async (cleanOptions) => {
  try {
    await checkIsDirectoryDeleted(cleanOptions);
    const { dest, name, isLastRepo, isOutPut } = cleanOptions;
    spinner_start(
      `Clearing ${(isOutPut && "resource") || "app"} ${name} ...\n`
    );
    if (dest) {
      await exec(`rm -rf ${dest}`);
      deleteTempData(name, "repos");
      spinner_succeed(
        `${(isOutPut && "Resource") || "App"} ${name} cleared successfully`
      );
      isOutPut && deleteTempData(name, "data");
      isOutPut && isLastRepo && deleteTempData("data") && process.exit(0);
    }
  } catch (error) {
    console.log("cleanFunc ~ error:", error);
    process.exit(0);
  }
};

// 检查目录是否已被删除
const checkIsDirectoryDeleted = async (checkOptions) => {
  const { dest, name, isLastRepo, isOutPut, isLoop } = checkOptions;
  if (!dest) {
    spinner_succeed(
      `${
        (isOutPut && "Resource") || "App"
      } ${name} cleared successfully or not exist.`
    );
    // 如果是循环且为最后一个则退出, 非循环下且为最后一个也退出
    ((isLoop && isLastRepo) || (!isLoop && isLastRepo)) && process.exit(0);
  }
  if (dest) {
    await fs.access(dest, fs.constants.F_OK, (accessError) => {
      if (accessError && accessError.code === "ENOENT") {
        spinner_succeed(
          `${
            (isOutPut && "Resource") || "App"
          } ${name} cleared successfully or not exist.`
        );
        isOutPut && isLastRepo && process.exit(0);
      }
    });
  }
};

module.exports = {
  processExecClean,
};
