use core::str;
use lapin::types::Boolean;
use regex::Regex;
use std::io;
use tokio::fs;
use tokio::process::Command;


pub async fn check_dir_exists(path: &str) -> Boolean {
    let status = match fs::try_exists(path).await {
        Ok(val) => val,
        Err(_e) => false,
    };
    return status;
}

pub async fn create_dir(path: &str) -> io::Result<()> {
    fs::create_dir(path).await?;
    Ok(())
}

pub async fn clone_repository(repo_url: &str, repo_path: &str) -> io::Result<()> {
    Command::new("git")
        .arg("clone")
        .arg(repo_url)
        .arg(repo_path)
        .status()
        .await?;
    Ok(())
}

pub fn sanitize_volume_name(vol_name: &str) -> Result<&str, io::Error> {
    if vol_name.chars().all(|c| c.is_alphanumeric() || c == '_') {
        Ok(vol_name)
    } else {
        Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "Volume name contains invalid characters",
        ))
    }
}

pub async fn check_docker_vol_exists(vol_name: &str) -> Boolean {
    let vol_name = sanitize_volume_name(vol_name).unwrap();
    let output = Command::new("docker")
        .arg("volume")
        .arg("inspect")
        .arg(vol_name)
        .output()
        .await
        .unwrap();

    if output.status.success() {
        return true;
    }
    false
}

pub async fn create_docker_volume(vol_name: &str) -> io::Result<()> {
    let vol_name = sanitize_volume_name(vol_name)?;
    let output = Command::new("docker")
        .arg("volume")
        .arg("create")
        .arg(vol_name)
        .output()
        .await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(io::Error::new(
            io::ErrorKind::Other,
            format!("Failed to create Docker volume: {}", stderr),
        ));
    }

    println!("Successfully created a docker volume {}", vol_name);
    Ok(())
}

pub async fn start_docker_compose(
    path: &str,
    vol_name: &str,
    service_name: &str,
) -> io::Result<()> {
    let output = Command::new("docker-compose")
        .arg("-p")
        .arg(service_name)
        .arg("up")
        .arg("-d")
        .env("VOLUME_NAME", vol_name)
        .env("SERVICE_NAME", service_name)
        .current_dir(path)
        .output()
        .await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(io::Error::new(
            io::ErrorKind::Other,
            format!("Failed to docker compose {}", stderr),
        ));
    }

    println!("Docker Compose Up Completed Successfully");
    Ok(())
}

pub async fn get_ports_of_services(
    playground_name: &str,
) -> Result<(u32, u32), Box<dyn std::error::Error>> {
    let main_service = format!("{}-service", playground_name);
    let websocket_service = format!("{}-ws", playground_name);

    async fn get_port(service_name: &str) -> Result<u32, Box<dyn std::error::Error>> {
        let output = Command::new("docker")
            .arg("container")
            .arg("port")
            .arg(service_name)
            .output()
            .await?;

        if !output.status.success() {
            return Err(format!("Cannot find port of service: {}", service_name).into());
        }

        let output_str = str::from_utf8(&output.stdout)?.trim();

        let re = Regex::new(r"->.*:(\d+)")?;
        if let Some(captures) = re.captures(output_str) {
            if let Some(port_match) = captures.get(1) {
                let port = port_match.as_str().parse::<u32>()?;
                return Ok(port);
            }
        }

        Err(format!( "Could not extract port number from output: {}", output_str) .into())
    }

    let main_port = get_port(&main_service).await?;
    let websocket_port = get_port(&websocket_service).await?;

    Ok((main_port, websocket_port))
}

