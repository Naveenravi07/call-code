use futures_lite::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, BasicRejectOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties,
};
use serde::{Deserialize, Serialize};
mod utils;

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    id: String,
    playground_name: String,
    service_name: String,
}

const IMG_DIR_PATH: &str = "./base-images";
const IMG_GH_REPO_URL: &str = "https://github.com/Naveenravi07/call-code-base-images";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let rmq_addr = "amqp://guest:guest@localhost:5672";
    let queue_name = "nova-orchestrator";
    let username = "cc_orchestrator";

    let channel = setup_rabbitmq_channel(rmq_addr, queue_name).await?;
    let mut consumer = setup_consumer(&channel, queue_name).await?;

    println!("Waiting for messages...");

    while let Some(delivery_result) = consumer.next().await {
        if let Err(e) = process_message(delivery_result, username).await {
            eprintln!("Error processing message: {}", e);
        }
    }

    Ok(())
}

async fn setup_rabbitmq_channel(
    rmq_addr: &str,
    queue_name: &str,
) -> Result<lapin::Channel, Box<dyn std::error::Error>> {
    let conn = Connection::connect(rmq_addr, ConnectionProperties::default())
        .await
        .map_err(|e| format!("Failed to connect to RabbitMQ: {}", e))?;

    let channel = conn
        .create_channel()
        .await
        .map_err(|e| format!("Failed to create channel: {}", e))?;

    channel
        .queue_declare(
            queue_name,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .map_err(|e| format!("Failed to declare queue: {}", e))?;

    Ok(channel)
}

async fn setup_consumer(
    channel: &lapin::Channel,
    queue_name: &str,
) -> Result<lapin::Consumer, Box<dyn std::error::Error>> {
    channel
        .basic_consume(
            queue_name,
            "consumer_tag",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)
}

async fn process_message(
    delivery_result: Result<lapin::message::Delivery, lapin::Error>,
    username: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let delivery = match delivery_result {
        Ok(delivery) => delivery,
        Err(e) => {
            eprintln!("Failed to consume message: {}", e);
            return Ok(());
        }
    };

    let data = String::from_utf8_lossy(&delivery.data);
    let msg: Message = match serde_json::from_str(&data) {
        Ok(msg) => msg,
        Err(e) => {
            eprintln!("Failed to parse message: {}", e);
            return Ok(());
        }
    };
    let _result = match handle_message(&msg, username).await {
        Ok(res) => res,
        Err(_e) => {
            println!("{:?}", _e);
            println!("Error occured while handling message; so rejecting");
            delivery
                .reject(BasicRejectOptions::default())
                .await
                .unwrap();
        }
    };

    if let Err(e) = delivery.ack(BasicAckOptions::default()).await {
        eprintln!("Failed to acknowledge message: {}", e);
    }

    Ok(())
}

async fn handle_message(msg: &Message, username: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!(
        "Processing message for user: {}, playground: {}, service: {}",
        username, msg.playground_name, msg.service_name
    );

    let dir = utils::check_dir_exists(&IMG_DIR_PATH).await;
    if !dir {
        utils::create_dir(&IMG_DIR_PATH).await?;
        utils::clone_repository(&IMG_GH_REPO_URL, &IMG_DIR_PATH).await?;
    }

    let vol_exist = utils::check_docker_vol_exists(&msg.playground_name).await;
    if vol_exist {
        return Err(format!(
            "Docker volume '{}' already exists. Cannot proceed.",
            msg.playground_name
        )
        .into());
    }

    utils::create_docker_volume(&msg.playground_name).await?;

    let service_path = format!("{}/{}", &IMG_DIR_PATH, &msg.service_name);
    let service_exists = utils::check_dir_exists(&service_path).await;

    if !service_exists {
        return Err(format!("Invalid service found  Cannot proceed.",).into());
    }

    utils::start_docker_compose(&service_path, &msg.playground_name, &msg.playground_name).await?;
    Ok(())
}
