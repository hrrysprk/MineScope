import polars as pl
import json
from pathlib import Path
from src.layers.silver.lidar_transform import transform_lidar
from src.layers.silver.chemistry_transform import transform_chemistry
from src.layers.silver.metagenomics_transform import transform_blast_to_functional_summary
from src.layers.gold.spatial_merge import merge_spatial_data

# Paths
bronze = Path("data/bronze")
silver = Path("data/silver")
gold = Path("data/gold")

# Bronze → Silver
transform_lidar(
    bronze / "lidar" / "lidar_grid.csv",
    silver / "lidar" / "lidar_grid.parquet",
)

transform_chemistry(
    bronze / "chemistry" / "soil_chemistry.csv",
    silver / "chemistry" / "soil_chemistry.parquet",
)

transform_blast_to_functional_summary(
    Path("results_full/pathways/metapathways_out/assembled_contigs/blast_results/assembled_contigs.swissprot.BLASTout"),
    silver / "metagenomics" / "functional_summary.parquet",
)

# Silver → Gold
merge_spatial_data(
    silver / "lidar" / "lidar_grid.parquet",
    silver / "chemistry" / "soil_chemistry.parquet",
    silver / "metagenomics" / "functional_summary.parquet",
    gold / "spatial_merged.parquet",
)

print("Pipeline complete → data/gold/spatial_merged.parquet")


# Gold → Dashboard JSON
df_export = pl.read_parquet(gold / "spatial_merged.parquet")
records = df_export.to_dicts()

dashboard_path = Path("dashboard/public/gold_layer.json")
dashboard_path.parent.mkdir(parents=True, exist_ok=True)

with open(dashboard_path, "w") as f:
    json.dump(records, f)

print(f"Exported {len(records)} records → {dashboard_path}")