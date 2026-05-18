process PATHWAY_PROFILING {
    container 'quay.io/hallamlab/metapathways'

    publishDir "${params.outdir}/pathways", mode: 'copy'

    input:
    path contigs
    path db_path

    output:
    path "metapathways_out/", emit: results

    script:
    """
    cp ${contigs} assembled_contigs.fasta
    metapathways run \
        -i assembled_contigs.fasta \
        -o metapathways_out \
        -d ${db_path} \
        --annotation_dbs swissprot \
        --annotation_algorithm BLAST \
        -t ${task.cpus}
    """
}