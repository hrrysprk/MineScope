process ASSEMBLE_READS {
    conda 'bioconda::megahit=1.2.9'
    container 'biocontainers/megahit:1.2.9_cv1'

    publishDir "${params.outdir}/assembly", mode: 'copy'

    input:
    path fastq

    output:
    path "megahit_out/final.contigs.fa", emit: contigs

    script:
    """
    megahit --read ${fastq} -o megahit_out
    """
}