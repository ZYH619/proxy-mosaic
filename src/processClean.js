/*
 * @Description: 后面可能会考虑重构此模块
 * @Author: shanchuan
 * @Date: 2024-04-29 11:12:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-04-29 17:58:29
 */
const fs = require("fs");
const fse = require("fs-extra");
const { setPropertyInLast } = require("./utils");
const { deleteFromJs, readFromJs } = require("./temp/index");
const { processOra } = require("./actuator/ora");
const { spinner_start, spinner_succeed, spinner_fail } = processOra();

// 执行清除
const processExecClean = async (configs) => {
  try {
    const { paths, options } = configs;
    const dataTemp = readFromJs("data");
    const reposTmp = readFromJs("repos");
    let repos = [];
    if (paths[0] === "all") {
      repos = Object.values(reposTmp);
      // 如果本地temp没有说明全部已经清除完毕
      if (!repos.length) {
        spinner_succeed("ALL app has been cleaned");
        process.exit(1);
      }
    } else {
      const specifyRepos = Object.values(reposTmp).filter((v) => {
        return paths.includes(v.name) || paths.includes(v.byName);
      });
      repos = setPropertyInLast(specifyRepos, "isLastRepo");
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
    spinner_start(`Clearing ${(isOutPut && "resource") || "app"} ${name} ...`);
    if (dest) {
      await fse.remove(dest);
      deleteFromJs(name, "repos");
      spinner_succeed(
        `${(isOutPut && "Resource") || "App"} ${name} cleared successfully`
      );
      isOutPut && deleteFromJs(name, "data");
      isOutPut && isLastRepo && process.exit(1);
    }
  } catch (error) {
    spinner_fail(error);
    process.exit(1);
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
    ((isLoop && isLastRepo) || (!isLoop && isLastRepo)) && process.exit(1);
  }
  if (dest) {
    await fs.access(dest, fs.constants.F_OK, (accessError) => {
      if (accessError && accessError.code === "ENOENT") {
        spinner_succeed(
          `${
            (isOutPut && "Resource") || "App"
          } ${name} cleared successfully or not exist.`
        );
        isOutPut && isLastRepo && process.exit(1);
      }
    });
  }
};

module.exports = {
  processExecClean,
};