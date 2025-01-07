const { StepFunctionsBuilder } = require('../src');

const workflow = new StepFunctionsBuilder()
  .startWith('ReceiveOrder')
  .dynamoDb('SaveOrder', 'putItem', {
    TableName: 'Orders',
    Item: {
      orderId: { S: '$.orderId' },
      data: { S: '$.orderData' },
    },
  })
  .next('NotifyService')
  .sns('NotifyService', 'publish', {
    TopicArn: 'arn:aws:sns:region:account:OrdersTopic',
    Message: {
      default: 'New order received',
      'data.$': '$.orderData',
    },
  })
  .next('ProcessOrder')
  .lambda(
    'ProcessOrder',
    'arn:aws:lambda:region:account:function:process-order'
  )
  .next('SendNotification')
  .sqs('SendNotification', 'sendMessage', {
    QueueUrl: 'https://sqs.region.amazonaws.com/account/NotificationsQueue',
    MessageBody: {
      type: 'ORDER_PROCESSED',
      'data.$': '$.result',
    },
  })
  .end()
  .build();

console.log(JSON.stringify(workflow, null, 2));
