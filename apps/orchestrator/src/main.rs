use futures_lite::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties,
};

struct Message {
    id: String,
    playground_name: String,
    service_name: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let rmq_addr: String = String::from("amqp://guest:guest@localhost:5672");
    let queue_name: String = String::from("nova-orchestrator");

    let conn = Connection::connect(&rmq_addr, ConnectionProperties::default())
        .await
        .expect("Connection error");

    let channel = conn.create_channel().await.expect("Create channel failed");

    //
    //In order to consume messages in a queue. First we need to declare a queue with same
    //spec mentioned in server.
    //
    
    let _queue = channel
        .queue_declare(
            &queue_name,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("Queue not found in channel");

    let mut consumer = channel
        .basic_consume(
            &queue_name,
            "consumer_tag",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    println!("Waiting for messages...");

    while let Some(delivery) = consumer.next().await {
        if let Ok(delivery) = delivery {
            let data = String::from_utf8_lossy(&delivery.data);
            println!("Received: {}", data);
            delivery.ack(BasicAckOptions::default()).await?;
        }
    }

    Ok(())
}
