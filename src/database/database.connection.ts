import * as AWS from "aws-sdk";
require("dotenv").config();
type PutItem = AWS.DynamoDB.DocumentClient.PutItemInput;
type PutItemOutput = AWS.DynamoDB.DocumentClient.PutItemOutput;

// Batch write
type BatchWrite = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
type BatchWriteOutPut = AWS.DynamoDB.DocumentClient.BatchWriteItemOutput;

// Update
type UpdateItem = AWS.DynamoDB.DocumentClient.UpdateItemInput;
type UpdateItemOutPut = AWS.DynamoDB.DocumentClient.UpdateItemOutput;

// Query
type QueryItem = AWS.DynamoDB.DocumentClient.QueryInput;
type QueryItemOutput = AWS.DynamoDB.DocumentClient.QueryOutput;

// Get
type GetItem = AWS.DynamoDB.DocumentClient.GetItemInput;
type GetItemOutput = AWS.DynamoDB.DocumentClient.GetItemOutput;

// Delete
type DeleteItem = AWS.DynamoDB.DocumentClient.DeleteItemInput;
type DeleteItemOutput = AWS.DynamoDB.DocumentClient.DeleteItemOutput;

// Get
type GetAll = AWS.DynamoDB.DocumentClient.ScanInput;
type GetAllOutput = AWS.DynamoDB.DocumentClient.GetItemOutput;

// type Item = {[index: string]: string};

// AWS.config.update({ region: "eu-west-1" });
let dynamodb = new AWS.DynamoDB({
  region: "localhost",
  endpoint: "http://localhost:8000",
});

const documentClient = new AWS.DynamoDB.DocumentClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
  // apiVersion: '2012-08-10'
});

export default class DatabaseService {
  constructor() {
    console.log("constructor called", `${process.env.TABLE}`);
    var params = {
      TableName: `${process.env.TABLE}`,
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" }, //Partition key
        // { AttributeName: "title", KeyType: "RANGE" }, //Sort key
      ],
      AttributeDefinitions: [
        // { AttributeName: "year", AttributeType: "N" },
        { AttributeName: "id", AttributeType: "S" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
    };
    dynamodb.createTable(params, function (err, data) {
      if (err) {
          if(err.code == "ResourceInUseException"){
            console.log("Database connected successfully");
          }else{
            console.log("Error occured while creating database---",err.code);
          }
        
      } else {
        console.log("Database created successfully");
      }
    });
  }

  create = async (params: PutItem): Promise<PutItemOutput> => {
    try {
      return await documentClient.put(params).promise();
    } catch (error) {
      throw new Error(`create: ${error}`);
      // throw new ResponseModel({}, 500, `create-error: ${error}`);
    }
  };

  getAll = async (params: GetAll): Promise<GetAllOutput> => {
    try {
      console.log("getAll===============", params);
      return await documentClient.scan(params).promise();
    } catch (error) {
      throw new Error(`scan-error: ${error}`);
    }
  };

  batchCreate = async (params: BatchWrite): Promise<BatchWriteOutPut> => {
    try {
      return await documentClient.batchWrite(params).promise();
    } catch (error) {
      throw new Error(`batch-write-error: ${error}`);
    }
  };

  update = async (params: UpdateItem): Promise<UpdateItemOutPut> => {
    try {
      return await documentClient.update(params).promise();
    } catch (error) {
      throw new Error(`update: ${error}`);
    }
  };

  query = async (params: QueryItem): Promise<QueryItemOutput> => {
    try {
      return await documentClient.query(params).promise();
    } catch (error) {
      // throw new ResponseModel({}, 500, `query-error: ${error}`);
    }
  };

  get = async (params: GetItem): Promise<GetItemOutput> => {
    try {
      return await documentClient.get(params).promise();
    } catch (error) {
      throw new Error(`get: ${error}`);
    }
  };

  delete = async (params: DeleteItem): Promise<DeleteItemOutput> => {
    try {
      return await documentClient.delete(params).promise();
    } catch (error) {
      throw new Error(`delete: ${error}`);
      // throw new ResponseModel({}, 500, `delete-error: ${error}`);
    }
  };
}
