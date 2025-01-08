use futures_lite::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    id: String,
    playground_name: String,
    service_name: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let rmq_addr = "amqp://guest:guest@localhost:5672";
    let queue_name = "nova-orchestrator";

    let conn = Connection::connect(rmq_addr, ConnectionProperties::default())
        .await
        .expect("Failed to connect to RabbitMQ");

    let channel = conn
        .create_channel()
        .await
        .expect("Failed to create channel");

    // Declare the queue
    channel
        .queue_declare(
            queue_name,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("Failed to declare queue");

    let mut consumer = channel
        .basic_consume(
            queue_name,
            "consumer_tag",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("Failed to start consumer");

    println!("Waiting for messages...");

    while let Some(delivery_result) = consumer.next().await {
        match delivery_result {
            Ok(delivery) => {
                let data = String::from_utf8_lossy(&delivery.data);
                match serde_json::from_str::<Message>(&data) {
                    Ok(msg) => {
                        println!("Parsed: {:?}", msg);
                        

                        if let Err(e) = delivery.ack(BasicAckOptions::default()).await {
                            eprintln!("Failed to acknowledge message: {}", e);
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to parse message: {}", e);
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to consume message: {}", e);
            }
        }
    }

    Ok(())
}

