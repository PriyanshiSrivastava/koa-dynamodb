import * as Koa from "koa";
import * as Router from "koa-router";
import { v4 as UUID } from "uuid";
import DatabaseService from "../database/database.connection";
import * as HttpStatus from "http-status-codes";
import * as moment from "moment";

const routerOpts: Router.IRouterOptions = {
  prefix: "/movies",
};
interface movie {
  title: string;
  year?: number;
  review?: object;
  id: string;
  time: string;
}
const databaseService = new DatabaseService();
const router: Router = new Router(routerOpts);

router.get("/all", async (ctx: Koa.Context) => {
  // ctx.body = 'GET ALL';
  let data = await databaseService.getAll({
    TableName: `${process.env.TABLE}`,
  });
  ctx.body = {
    data,
  };
});

router.get("/get/:id", async (ctx: Koa.Context) => {
  // ctx.body = 'GET SINGLE';
  const getParams = {
    TableName: `${process.env.TABLE}`,
    Key: { id:ctx.params.id }
  }
  let data = await databaseService.get(getParams);
  ctx.body = {
    data,
  };
});

router.post("/", async (ctx: Koa.Context) => {
  try {
    //   ctx.body = 'POST';
    console.log("post---");
    const requestData = ctx.request.body;
    console.log("requestData", requestData);

    const data = <movie>requestData;
    data.id = UUID();
    data.time = moment(new Date(), "MM-DD-YYYY")
      .utc()
      .format("YYYY-MM-DD");
    const params = {
      TableName: `${process.env.TABLE}`,
      Item: data,
    };
    // Inserts item into DynamoDB table
    const created = await databaseService.create(params);
    console.log("created", created);
    ctx.body = {
      data: {
        status: true,
        message: "created successfully",
        data,
      },
    };
  } catch (err) {
    ctx.throw({ status: HttpStatus.BAD_REQUEST, error: err.message });
  }
});

router.delete("/delete/:id", async (ctx: Koa.Context) => {
  // ctx.body = "DELETE";

  const getParams = {
    TableName: `${process.env.TABLE}`,
    Key: { id:ctx.params.id }
    };
  let data = await databaseService.delete(getParams);
  ctx.body = {
    data: {
      status: true,
      message: "deleted successfully",
      // data
    },
  };
});

router.put("/update/:id", async (ctx: Koa.Context) => {
  // ctx.body = "PATCH";
  let review = ctx.request.body.review;
  const params = {
    TableName: `${process.env.TABLE}`,
    Key: { id:ctx.params.id },
     UpdateExpression: "set #review = :review, #year = :year,#title = :title, updatedAt = :timestamp",
    ExpressionAttributeNames: {
      "#review": "review",
      "#title":"title",
      "#year":"year"
    },
    ExpressionAttributeValues: {
      ":review": review,
      ":timestamp": new Date().getTime(),
      ":year":ctx.request.body.year,
      ":title":ctx.request.body.title
    },
    ReturnValues: "UPDATED_NEW",
  };
  // Updates Item in DynamoDB table
  let data  = await databaseService.update(params);
  ctx.body = {
    status: true,
    message: "updated successfully",
    // data
  };
});

export default router;
